<!-- src/components/CommentModal.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useComments } from '../composables/useComments';

const props = defineProps({
  boardId: {
    type: [Number, String],
    required: true
  },
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const { getCommentsByBoardId, addComment, deleteComment } = useComments();

// 새 댓글 입력 폼 상태
const newWriter = ref('');
const newContent = ref('');
const newPassword = ref('');

// 현재 게시글의 댓글 목록 필터링
const currentComments = computed(() => getCommentsByBoardId(props.boardId));

// 댓글 작성 핸들러
const handleAddComment = () => {
  if (!newWriter.value.trim() || !newContent.value.trim() || !newPassword.value.trim()) {
    alert('작성자, 내용, 비밀번호를 모두 입력해주세요.');
    return;
  }

  addComment(props.boardId, {
    writer: newWriter.value,
    content: newContent.value,
    password: newPassword.value
  });

  // 입력창 초기화
  newWriter.value = '';
  newContent.value = '';
  newPassword.value = '';
};

// 댓글 삭제 핸들러 (비밀번호 입력받음)
const handleDeleteComment = (commentId) => {
  const password = prompt('댓글을 삭제하려면 비밀번호를 입력하세요:');
  if (password === null) return; // 취소 버튼 누름

  const result = deleteComment(commentId, password);
  alert(result.message);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>💬 댓글 목록 ({{ currentComments.length }}개)</h3>
        <button class="close-btn" @click="emit('close')">❌</button>
      </div>

      <!-- 댓글 목록 영역 -->
      <div class="comments-list">
        <div v-if="currentComments.length === 0" class="no-comments">
          첫 댓글을 작성해보세요!
        </div>
        <div v-else v-for="comment in currentComments" :key="comment.id" class="comment-item">
          <div class="comment-info">
            <span class="comment-writer">👤 {{ comment.writer }}</span>
            <span class="comment-date">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
          <button class="comment-del-btn" @click="handleDeleteComment(comment.id)">삭제</button>
        </div>
      </div>

      <!-- 댓글 작성 폼 영역 -->
      <form @submit.prevent="handleAddComment" class="comment-form">
        <div class="form-row">
          <input v-model="newWriter" type="text" placeholder="작성자" required />
          <input v-model="newPassword" type="password" placeholder="비밀번호" required />
        </div>
        <textarea v-model="newContent" placeholder="댓글을 입력하세요..." required></textarea>
        <button type="submit" class="submit-btn">등록</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  padding: 24px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.no-comments {
  text-align: center;
  color: #9ca3af;
  padding: 20px 0;
}

.comment-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  position: relative;
}

.comment-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.comment-writer {
  font-weight: bold;
  color: #374151;
}

.comment-text {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  white-space: pre-line;
}

.comment-del-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  color: #ef4444;
  border: none;
  font-size: 11px;
  cursor: pointer;
}

.comment-form {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.comment-form textarea {
  width: 100%;
  height: 60px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
  box-sizing: border-box;
}

.submit-btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn:hover {
  background: #4338ca;
}
</style>