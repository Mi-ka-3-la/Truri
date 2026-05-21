/* ===================================================================
   CERT PREP — Additional JavaScript
   ===================================================================
   These functions are SPECIFIC to the pdf-to-cert-prep skill. They
   extend main.js without modifying it. Always include this file in
   the course directory and load it in _base.html AFTER main.js.

   <script src="main.js" defer></script>
   <script src="main-cert.js" defer></script>  ← this file, AFTER main.js
   =================================================================== */

(function() {
  'use strict';

  // ============================================
  // EXAM-STYLE QUIZ
  // ============================================

  // Tracks the selected option per question block
  window.selectExamOption = function(buttonEl) {
    const questionBlock = buttonEl.closest('.exam-question-block');
    if (!questionBlock) return;

    // If already revealed, ignore further clicks
    if (questionBlock.classList.contains('revealed')) return;

    // Clear previous selections in this question
    questionBlock.querySelectorAll('.exam-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Mark this option as selected
    buttonEl.classList.add('selected');
    questionBlock.dataset.selectedValue = buttonEl.dataset.value;
  };

  // Reveals all answers + explanations in a quiz container
  window.checkExamQuiz = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.exam-question-block').forEach(block => {
      const correctValue = block.dataset.correct;
      const selectedValue = block.dataset.selectedValue;
      const options = block.querySelectorAll('.exam-option');
      const feedbackDiv = block.querySelector('.exam-feedback');

      // Mark correct/incorrect on each option
      options.forEach(opt => {
        const value = opt.dataset.value;
        if (value === correctValue) {
          opt.classList.add('correct');
        } else if (value === selectedValue) {
          opt.classList.add('incorrect');
        }
      });

      // Build feedback content — ALL options' explanations
      let feedbackHTML = '';
      options.forEach(opt => {
        const value = opt.dataset.value;
        // Convert "option-a" → "a"
        const letterMatch = value.match(/option-([a-z])/i);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : value.charAt(value.length - 1).toUpperCase();
        const explanation = block.dataset['explanation' + letter] || block.getAttribute('data-explanation-' + letter.toLowerCase());
        const isCorrect = (value === correctValue);
        const cssClass = isCorrect ? 'feedback-correct' : 'feedback-wrong';
        const prefix = isCorrect ? letter + ' (Correct):' : letter + ':';

        feedbackHTML += `
          <div class="exam-feedback-row ${cssClass}">
            <strong>${prefix}</strong>
            <span>${explanation || '(No explanation provided)'}</span>
          </div>
        `;
      });

      feedbackDiv.innerHTML = feedbackHTML;
      feedbackDiv.classList.add('revealed');
      block.classList.add('revealed');
    });
  };

  // Resets a quiz to initial state
  window.resetExamQuiz = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.exam-question-block').forEach(block => {
      block.classList.remove('revealed');
      delete block.dataset.selectedValue;

      block.querySelectorAll('.exam-option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });

      const feedbackDiv = block.querySelector('.exam-feedback');
      if (feedbackDiv) {
        feedbackDiv.classList.remove('revealed');
        feedbackDiv.innerHTML = '';
      }
    });
  };

  // ============================================
  // MOCK EXAM
  // ============================================

  // Selecting a mock option (same UX as exam, just different class names)
  window.selectMockOption = function(buttonEl) {
    const questionBlock = buttonEl.closest('.mock-question-block');
    if (!questionBlock) return;

    if (questionBlock.classList.contains('revealed')) return;

    questionBlock.querySelectorAll('.mock-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    buttonEl.classList.add('selected');
    questionBlock.dataset.selectedValue = buttonEl.dataset.value;
  };

  // Submit the mock exam — reveals all answers + score
  window.submitMockExam = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const questions = container.querySelectorAll('.mock-question-block');
    let correctCount = 0;
    const totalCount = questions.length;
    const domainScores = {};

    questions.forEach(block => {
      const correctValue = block.dataset.correct;
      const selectedValue = block.dataset.selectedValue;
      const domain = block.dataset.domain || 'Unspecified';
      const options = block.querySelectorAll('.mock-option');
      const feedbackDiv = block.querySelector('.mock-feedback');

      // Initialize domain tracker
      if (!domainScores[domain]) {
        domainScores[domain] = { correct: 0, total: 0 };
      }
      domainScores[domain].total += 1;

      const isCorrect = (selectedValue === correctValue);
      if (isCorrect) {
        correctCount += 1;
        domainScores[domain].correct += 1;
      }

      // Mark options
      options.forEach(opt => {
        const value = opt.dataset.value;
        if (value === correctValue) {
          opt.classList.add('correct');
        } else if (value === selectedValue) {
          opt.classList.add('incorrect');
        }
      });

      // Build feedback for this question
      let feedbackHTML = '<div class="exam-feedback revealed">';
      options.forEach(opt => {
        const value = opt.dataset.value;
        const letterMatch = value.match(/option-([a-z])/i);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : value.charAt(value.length - 1).toUpperCase();
        const explanation = block.dataset['explanation' + letter] || block.getAttribute('data-explanation-' + letter.toLowerCase());
        const isOptCorrect = (value === correctValue);
        const cssClass = isOptCorrect ? 'feedback-correct' : 'feedback-wrong';
        const prefix = isOptCorrect ? letter + ' (Correct):' : letter + ':';
        feedbackHTML += `
          <div class="exam-feedback-row ${cssClass}">
            <strong>${prefix}</strong>
            <span>${explanation || '(No explanation provided)'}</span>
          </div>
        `;
      });
      feedbackHTML += '</div>';

      if (feedbackDiv) {
        feedbackDiv.innerHTML = feedbackHTML;
        feedbackDiv.classList.add('revealed');
      }
      block.classList.add('revealed');
    });

    // Compute score and render results
    const percentage = Math.round((correctCount / totalCount) * 100);
    const passingThreshold = parseInt(container.dataset.passingScore || '70', 10);
    const isPassing = (percentage >= passingThreshold);

    const resultsDiv = document.getElementById(container.dataset.resultsTarget || 'mock-exam-results');
    if (resultsDiv) {
      let domainBreakdownHTML = '';
      Object.keys(domainScores).forEach(domain => {
        const d = domainScores[domain];
        const dPct = Math.round((d.correct / d.total) * 100);
        domainBreakdownHTML += `
          <div class="mock-results-domain-row">
            <span><strong>${domain}</strong></span>
            <span>${d.correct} / ${d.total} (${dPct}%)</span>
          </div>
        `;
      });

      resultsDiv.innerHTML = `
        <p class="mock-results-score ${isPassing ? 'passing' : 'failing'}">${percentage}%</p>
        <p class="mock-results-summary">
          ${correctCount} of ${totalCount} correct.
          ${isPassing ? 'You\\'re on track for the real exam.' : 'Below the typical passing threshold — review weak domains and retake.'}
        </p>
        <h3 style="margin-top: var(--space-6, 1.5rem);">By domain</h3>
        <div class="mock-results-domain-breakdown">
          ${domainBreakdownHTML}
        </div>
      `;
      resultsDiv.hidden = false;
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset the mock exam
  window.resetMockExam = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.mock-question-block').forEach(block => {
      block.classList.remove('revealed');
      delete block.dataset.selectedValue;

      block.querySelectorAll('.mock-option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });

      const feedbackDiv = block.querySelector('.mock-feedback');
      if (feedbackDiv) {
        feedbackDiv.classList.remove('revealed');
        feedbackDiv.innerHTML = '';
      }
    });

    const resultsDiv = document.getElementById(container.dataset.resultsTarget || 'mock-exam-results');
    if (resultsDiv) {
      resultsDiv.hidden = true;
      resultsDiv.innerHTML = '';
    }

    // Scroll back to top of mock exam
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ============================================
  // KEYBOARD SUPPORT
  // ============================================
  // Make buttons accessible via Enter and Space (already default for <button>,
  // but we ensure consistent behavior across exam-style options)

  document.addEventListener('keydown', function(e) {
    const target = e.target;
    if (!target) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (target.classList.contains('exam-option') || target.classList.contains('mock-option')) {
        e.preventDefault();
        target.click();
      }
    }
  });
})();
