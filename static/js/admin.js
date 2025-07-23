// 관리자 페이지 JavaScript

let questions = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    initializeEventListeners();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 새 질문 추가 폼
    document.getElementById('addQuestionForm').addEventListener('submit', handleAddQuestion);
    
    // 질문 유형 변경 시 옵션 표시/숨기기
    document.getElementById('questionType').addEventListener('change', handleQuestionTypeChange);
    
    // 옵션 추가 버튼
    document.getElementById('addOptionBtn').addEventListener('click', addOptionInput);
}

// 질문 목록 로드
async function loadQuestions() {
    try {
        showLoading(true);
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('질문을 불러오는데 실패했습니다.');
        }
        
        questions = await response.json();
        renderQuestionsList();
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('질문을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// 질문 목록 렌더링
function renderQuestionsList() {
    const container = document.getElementById('questionsList');
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-question-circle fa-2x mb-2"></i>
                <p>등록된 질문이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = questions.map((question, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-1">
                            ${index + 1}. ${question.question}
                            ${question.required ? '<span class="badge bg-danger ms-2">필수</span>' : ''}
                        </h6>
                        <p class="card-text">
                            <small class="text-muted">
                                유형: ${getQuestionTypeText(question.type)}
                                ${question.options && question.options.length > 0 ? 
                                    `<br>옵션: ${question.options.join(', ')}` : ''}
                            </small>
                        </p>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" 
                            onclick="deleteQuestion('${question.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 질문 유형 텍스트 반환
function getQuestionTypeText(type) {
    const typeMap = {
        'text': '텍스트 입력',
        'number': '숫자 입력',
        'select': '드롭다운 선택',
        'radio': '라디오 버튼',
        'checkbox': '체크박스'
    };
    return typeMap[type] || type;
}

// 질문 유형 변경 처리
function handleQuestionTypeChange(event) {
    const type = event.target.value;
    const optionsContainer = document.getElementById('optionsContainer');
    const optionsList = document.getElementById('optionsList');
    
    if (['select', 'radio', 'checkbox'].includes(type)) {
        optionsContainer.style.display = 'block';
        // 기본 옵션 2개 추가
        optionsList.innerHTML = '';
        addOptionInput();
        addOptionInput();
    } else {
        optionsContainer.style.display = 'none';
        optionsList.innerHTML = '';
    }
}

// 옵션 입력 필드 추가
function addOptionInput() {
    const optionsList = document.getElementById('optionsList');
    const optionIndex = optionsList.children.length;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'input-group mb-2';
    optionDiv.innerHTML = `
        <input type="text" class="form-control option-input" 
               placeholder="옵션 ${optionIndex + 1}" required>
        <button type="button" class="btn btn-outline-danger" 
                onclick="removeOptionInput(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    optionsList.appendChild(optionDiv);
}

// 옵션 입력 필드 제거
function removeOptionInput(button) {
    button.parentElement.remove();
}

// 새 질문 추가 처리
async function handleAddQuestion(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const formData = new FormData(form);
        
        const questionData = {
            question: document.getElementById('questionText').value.trim(),
            type: document.getElementById('questionType').value,
            required: document.getElementById('isRequired').checked
        };
        
        // 선택형 질문인 경우 옵션 수집
        if (['select', 'radio', 'checkbox'].includes(questionData.type)) {
            const optionInputs = document.querySelectorAll('.option-input');
            questionData.options = Array.from(optionInputs)
                .map(input => input.value.trim())
                .filter(value => value.length > 0);
            
            if (questionData.options.length === 0) {
                showToast('선택형 질문은 최소 하나의 옵션이 필요합니다.', 'error');
                return;
            }
        } else {
            questionData.options = [];
        }
        
        showLoading(true);
        
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '질문 추가에 실패했습니다.');
        }
        
        // 성공 시 폼 리셋 및 목록 새로고침
        form.reset();
        document.getElementById('optionsContainer').style.display = 'none';
        await loadQuestions();
        showToast('질문이 성공적으로 추가되었습니다.', 'success');
        
    } catch (error) {
        console.error('Error adding question:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 질문 삭제
async function deleteQuestion(questionId) {
    if (!confirm('이 질문을 삭제하시겠습니까? 관련된 모든 응답 데이터도 영향을 받을 수 있습니다.')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/questions/${questionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '질문 삭제에 실패했습니다.');
        }
        
        await loadQuestions();
        showToast('질문이 성공적으로 삭제되었습니다.', 'success');
        
    } catch (error) {
        console.error('Error deleting question:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    const toast = document.getElementById('alertToast');
    const toastMessage = document.getElementById('toastMessage');
    
    // 토스트 색상 설정
    const toastHeader = toast.querySelector('.toast-header');
    toastHeader.className = 'toast-header';
    
    if (type === 'success') {
        toastHeader.classList.add('bg-success', 'text-white');
        toastHeader.querySelector('i').className = 'fas fa-check-circle text-white me-2';
    } else if (type === 'error') {
        toastHeader.classList.add('bg-danger', 'text-white');
        toastHeader.querySelector('i').className = 'fas fa-exclamation-circle text-white me-2';
    } else {
        toastHeader.classList.add('bg-info', 'text-white');
        toastHeader.querySelector('i').className = 'fas fa-info-circle text-white me-2';
    }
    
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// 로딩 스피너 표시/숨기기
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    
    if (show) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}
