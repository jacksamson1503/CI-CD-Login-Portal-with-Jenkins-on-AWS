<script>
    const toggleBtn = document.getElementById('togglebtn');
    const formWrapper = document.getElementById('formwrapper');
    const toggleHeading = document.getElementById('toggleheading');
    const toggleText = document.getElementById('toogleText');

    toggleBtn.addEventListener('click', () => {
      formWrapper.classList.toggle('active');
      if (formWrapper.classList.contains('active')) {
        toggleHeading.textContent = 'Already have an account?';
        toggleText.textContent = 'Login to your account';
        toggleBtn.textContent = 'Login';
        document.querySelector('.signin input').focus();
      } else {
        toggleHeading.textContent = "Don't have an account?";
        toggleText.textContent = 'Sign up to get started!';
        toggleBtn.textContent = 'Sign up';
        document.querySelector('.login input').focus();
      }
    });
  </script>