import os
import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_cors import CORS
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")
CORS(app)

# In-memory storage for MVP(TEST)
survey_questions = [
    {
        'id': str(uuid.uuid4()),
        'question': '건물명',
        'type': 'text',
        'required': True,
        'options': []
    },
    {
        'id': str(uuid.uuid4()),
        'question': '건물 주소',
        'type': 'text',
        'required': True,
        'options': []
    },
    {
        'id': str(uuid.uuid4()),
        'question': '건축연도',
        'type': 'number',
        'required': True,
        'options': []
    },
    {
        'id': str(uuid.uuid4()),
        'question': '지상 층수',
        'type': 'number',
        'required': True,
        'options': []
    },
    {
        'id': str(uuid.uuid4()),
        'question': '지하 층수',
        'type': 'number',
        'required': False,
        'options': []
    },
    {
        'id': str(uuid.uuid4()),
        'question': '건물 용도',
        'type': 'select',
        'required': True,
        'options': ['주거용', '상업용', '업무용', '공업용', '교육연구용', '의료용', '문화집회용', '종교용', '기타']
    },
    {
        'id': str(uuid.uuid4()),
        'question': '주차장 보유 여부',
        'type': 'radio',
        'required': True,
        'options': ['있음', '없음']
    },
    {
        'id': str(uuid.uuid4()),
        'question': '편의시설 (복수선택 가능)',
        'type': 'checkbox',
        'required': False,
        'options': ['엘리베이터', '에스컬레이터', '장애인 편의시설', '헬스장', '카페', '식당', '편의점', '은행', '병원']
    }
]

survey_responses = []

@app.route('/')
def index():
    """메인 설문조사 페이지"""
    return render_template('index.html', questions=survey_questions)

@app.route('/admin')
def admin():
    """관리자 페이지 - 질문 관리"""
    return render_template('admin.html', questions=survey_questions)

@app.route('/responses')
def responses():
    """응답 결과 보기 페이지"""
    return render_template('responses.html', responses=survey_responses, questions=survey_questions)

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """모든 질문 가져오기"""
    return jsonify(survey_questions)

@app.route('/api/questions', methods=['POST'])
def add_question():
    """새 질문 추가"""
    try:
        data = request.get_json()
        
        if not data or 'question' not in data or 'type' not in data:
            return jsonify({'error': '질문과 타입은 필수입니다.'}), 400
        
        new_question = {
            'id': str(uuid.uuid4()),
            'question': data['question'].strip(),
            'type': data['type'],
            'required': data.get('required', False),
            'options': data.get('options', [])
        }
        
        # 선택형 질문인데 옵션이 없으면 에러
        if new_question['type'] in ['select', 'radio', 'checkbox'] and not new_question['options']:
            return jsonify({'error': '선택형 질문은 최소 하나의 옵션이 필요합니다.'}), 400
        
        survey_questions.append(new_question)
        return jsonify(new_question), 201
        
    except Exception as e:
        logging.error(f"질문 추가 중 오류: {e}")
        return jsonify({'error': '질문 추가 중 오류가 발생했습니다.'}), 500

@app.route('/api/questions/<question_id>', methods=['DELETE'])
def delete_question(question_id):
    """질문 삭제"""
    try:
        global survey_questions
        survey_questions = [q for q in survey_questions if q['id'] != question_id]
        return jsonify({'message': '질문이 삭제되었습니다.'}), 200
    except Exception as e:
        logging.error(f"질문 삭제 중 오류: {e}")
        return jsonify({'error': '질문 삭제 중 오류가 발생했습니다.'}), 500

@app.route('/api/responses', methods=['POST'])
def submit_response():
    """설문 응답 제출"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '응답 데이터가 없습니다.'}), 400
        
        # 필수 질문 검증
        required_questions = [q for q in survey_questions if q.get('required', False)]
        missing_required = []
        
        for question in required_questions:
            if question['id'] not in data or not data[question['id']]:
                missing_required.append(question['question'])
        
        if missing_required:
            return jsonify({
                'error': f'다음 필수 항목을 입력해주세요: {", ".join(missing_required)}'
            }), 400
        
        # 응답 저장
        response = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.now().isoformat(),
            'answers': data
        }
        
        survey_responses.append(response)
        return jsonify({'message': '응답이 성공적으로 제출되었습니다.'}), 201
        
    except Exception as e:
        logging.error(f"응답 제출 중 오류: {e}")
        return jsonify({'error': '응답 제출 중 오류가 발생했습니다.'}), 500

@app.route('/api/responses', methods=['GET'])
def get_responses():
    """모든 응답 가져오기"""
    return jsonify(survey_responses)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
