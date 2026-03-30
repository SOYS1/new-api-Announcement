(() => {
  // 临时添加调试代码到页面
  const storyCards = document.querySelectorAll('details.story-card');
  console.log('Story cards 数量:', storyCards.length);
  
  if (storyCards.length > 0) {
    const firstCard = storyCards[0];
    const titleInput = firstCard.querySelector('[data-field="title"]');
    const subtitleInput = firstCard.querySelector('[data-field="subtitle"]');
    const summaryInput = firstCard.querySelector('[data-field="summary"]');
    const bodyInput = firstCard.querySelector('[data-field="body"]');
    
    console.log('第一个 story card 的数据:');
    console.log('  title:', titleInput?.value);
    console.log('  subtitle:', subtitleInput?.value);
    console.log('  summary:', summaryInput?.value);
    console.log('  body:', bodyInput?.value);
    
    // 检查是否有任何内容
    const hasContent = titleInput?.value || subtitleInput?.value || summaryInput?.value || bodyInput?.value;
    console.log('是否有内容:', !!hasContent);
  }
  
  // 检查 localStorage 中的状态
  const saved = localStorage.getItem('newapi-announcement-generator:v2');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      console.log('localStorage 中的 stories 数量:', state.stories?.length);
      if (state.stories && state.stories.length > 0) {
        console.log('localStorage 中第一个 story:', JSON.stringify(state.stories[0], null, 2));
      }
    } catch (e) {
      console.log('解析 localStorage 失败:', e);
    }
  }
})();
