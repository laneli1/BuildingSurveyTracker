// 설문조사 페이지 JavaScript

let questions = [];

// 페이지 로드 시 질문들을 로드
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    
    // 폼 제출 이벤트 리스너
    document.getElementById('surveyForm').addEventListener('submit', handleFormSubmit);
});

// 질문 목록 로드
async function loadQuestions() {
    try {
        showLoading(true);
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('질문을 불러오는데 실패했습니다.');
        }
        
        questions = await response.json();
        renderQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
        showAlert('질문을 불러오는 중 오류가 발생했습니다.', 'danger');
    } finally {
        showLoading(false);
    }
}

// 질문들을 화면에 렌더링
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const questionHtml = createQuestionHtml(question, index);
        container.innerHTML += questionHtml;
    });
}

// 개별 질문 HTML 생성
function createQuestionHtml(question, index) {
    const requiredMark = question.required ? '<span class="text-danger">*</span>' : '';
    
    let inputHtml = '';
    
    switch (question.type) {
        case 'text':
            inputHtml = `
                <input type="text" class="form-control" 
                       id="question_${question.id}" 
                       name="question_${question.id}"
                       ${question.required ? 'required' : ''}
                       placeholder="답변을 입력하세요">
            `;
            break;
            
        case 'number':
            inputHtml = `
                <input type="number" class="form-control" 
                       id="question_${question.id}" 
                       name="question_${question.id}"
                       ${question.required ? 'required' : ''}
                       placeholder="숫자를 입력하세요">
            `;
            break;
            
        case 'select':
            inputHtml = `
                <select class="form-select" 
                        id="question_${question.id}" 
                        name="question_${question.id}"
                        ${question.required ? 'required' : ''}>
                    <option value="">선택하세요</option>
                    ${question.options.map(option => 
                        `<option value="${option}">${option}</option>`
                    ).join('')}
                </select>
            `;
            break;
            
        case 'radio':
            inputHtml = question.options.map(option => `
                <div class="form-check">
                    <input class="form-check-input" type="radio" 
                           name="question_${question.id}" 
                           id="question_${question.id}_${option}" 
                           value="${option}"
                           ${question.required ? 'required' : ''}>
                    <label class="form-check-label" for="question_${question.id}_${option}">
                        ${option}
                    </label>
                </div>
            `).join('');
            break;
            
        case 'checkbox':
            inputHtml = question.options.map(option => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           name="question_${question.id}" 
                           id="question_${question.id}_${option}" 
                           value="${option}">
                    <label class="form-check-label" for="question_${question.id}_${option}">
                        ${option}
                    </label>
                </div>
            `).join('');
            break;
    }

    return `
        <div class="mb-4">
            <label class="form-label fw-bold">
                ${index + 1}. ${question.question} ${requiredMark}
            </label>
            ${inputHtml}
        </div>
    `;
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        const answers = {};
        
        // 각 질문에 대한 답변 수집
        questions.forEach(question => {
            if (question.type === 'checkbox') {
                // 체크박스는 여러 값을 배열로 처리
                const checkboxes = document.querySelectorAll(`input[name="question_${question.id}"]:checked`);
                answers[question.id] = Array.from(checkboxes).map(cb => cb.value);
            } else if (question.type === 'radio') {
                // 라디오 버튼
                const radio = document.querySelector(`input[name="question_${question.id}"]:checked`);
                answers[question.id] = radio ? radio.value : '';
            } else {
                // 텍스트, 숫자, 선택
                const input = document.getElementById(`question_${question.id}`);
                answers[question.id] = input ? input.value : '';
            }
        });
        
        // 서버로 응답 전송
        const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '응답 제출에 실패했습니다.');
        }
        
        // 성공 모달 표시
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
    } catch (error) {
        console.error('Error submitting response:', error);
        showAlert(error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// 로딩 스피너 표시/숨기기
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const submitBtn = document.getElementById('submitBtn');
    
    if (show) {
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>제출 중...';
    } else {
        spinner.classList.add('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>설문 제출하기';
    }
}

// 알림 메시지 표시
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
