import { h } from 'vue'
import { ElMessageBox } from 'element-plus'

export const useConfirmDelete = () => {
  const confirmDelete = (name, onConfirm) => {
    ElMessageBox.confirm(
      h('span', null, [
        '确定要删除 ',
        h('strong', { style: 'color: #303133; font-size: 15px; margin: 0 4px;' }, `「${name}」`),
        ' 吗？此操作不可撤销，请谨慎操作。'
      ]),
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        center: true,
        appendTo: 'body'
      }
    ).then(() => {
      onConfirm()
    }).catch(() => {})
  }
  return { confirmDelete }
}