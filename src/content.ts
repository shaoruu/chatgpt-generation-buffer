let didApplyStyles = false;
let lastHiddenElement: HTMLElement | null = null;
let generatingSpan: HTMLElement | null = null;

// Create a style element for the "generating" class
let styleElement = document.createElement('style');
styleElement.innerHTML = `
.generating {
  position: relative;
  visibility: hidden;
  background: red;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.generating span {
  visibility: visible;
  display: block;
  position: absolute;
  opacity: 0.5;
  top: 0;
  left: 0;
}`;
document.head.appendChild(styleElement);

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    const allResults = document.querySelectorAll('.markdown');
    const lastResult = allResults[allResults.length - 1];

    if (!lastResult) {
      return;
    }

    // Getting the last child of the result
    let lastChild = lastResult.children[
      lastResult.children.length - 1
    ] as HTMLElement;

    if (lastChild && lastChild.tagName === 'OL') {
      lastChild = lastChild.children[
        lastChild.children.length - 1
      ] as HTMLElement;
    }

    if (!lastChild) {
      return;
    }

    const isStreamingResult = lastResult.classList.contains('result-streaming');

    if (isStreamingResult) {
      if (!generatingSpan) {
        generatingSpan = document.createElement('span');
        generatingSpan.innerText = 'Generating...';
      }
      if (!lastChild.contains(generatingSpan)) {
        lastChild.appendChild(generatingSpan);
      }
      lastChild.classList.add('generating');
      if (lastHiddenElement && lastHiddenElement !== lastChild) {
        lastHiddenElement.classList.remove('generating');
      }
      lastHiddenElement = lastChild;
      didApplyStyles = true;
    } else if (didApplyStyles) {
      lastChild.classList.remove('generating');
      if (lastHiddenElement) {
        lastHiddenElement.classList.remove('generating');
        lastHiddenElement = null;
      }
      if (generatingSpan && lastChild.contains(generatingSpan)) {
        generatingSpan.remove();
      }
      didApplyStyles = false;
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false, // Changed this from true to false to prevent infinite loop
  characterData: true,
});
