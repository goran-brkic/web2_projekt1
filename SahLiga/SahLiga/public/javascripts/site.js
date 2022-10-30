let auth0 = null;
const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId,
      audience: config.audience
    });
};

const serverUri = "http://127.0.0.1:4091";


const initialLogin = async () => {
  try {    
    // Get the access token from the Auth0 client
    const token = await auth0.getTokenSilently();

    // Make the call to the API, setting the token
    // in the Authorization header
    const response = await fetch(`${serverUri}/api/member`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Fetch the JSON result
    const responseData = await response.json();     

} catch (e) {
    // Display errors in the console
    console.log(e);     
  }
};

 

const showMemberOptions = async () => {
  try {    
    // Get the access token from the Auth0 client
    const token = await auth0.getTokenSilently();   

    // Make the call to the API, setting the token
    // in the Authorization header
    const response = await fetch(`${serverUri}/api/member`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    // Fetch the JSON result
    const responseData = await response.json();

    if(responseData){
      // user is authorized - member
      document.getElementById('user').style.display = "block";
      document.getElementById('user').innerHTML = `<b>You are logged in as a member. ${JSON.parse(responseData).email}</b>`
      document.getElementById('comment_section').style.display = "block";
      document.getElementById('username').style.display = "block";
      document.getElementById('username').innerHTML = `<b>${JSON.parse(responseData).email}</b>`
      document.getElementById('user_email').value = JSON.parse(responseData).email;

      let comments = document.getElementsByClassName(`${JSON.parse(responseData).email}`)
      for(const comment of comments){
        let btns = comment.getElementsByClassName('btnEditComment');
        for(const btn of btns){
          btn.addEventListener("click", (e) => {
            e.target.style.display = "none"; // Hide edit button
            let parentDiv= e.target.parentElement.parentElement;
            let saveButton = parentDiv.getElementsByClassName('btnSaveComment')[0]
            saveButton.style.display = "block"; // show save button
            
            parentDiv.getElementsByClassName('user-comment-text')[0].style = "border-width: 3px; border-style:solid;" // make it obvious the text is editable
            parentDiv.getElementsByClassName('user-comment-text')[0].setAttribute("contenteditable", true); // make paragraph editable
            saveButton.addEventListener("click", (e) => {
              let parentDiv = e.target.parentElement.parentElement;
              parentDiv.getElementsByClassName('user-comment-text')[0].setAttribute("contenteditable", false);
              parentDiv.getElementsByClassName('comment-text')[0].value = parentDiv.getElementsByClassName('user-comment-text')[0].innerHTML;
              parentDiv.submit(); // parentDiv is actually a form
            })
          });
          btn.style.display = "block";
        }
        btns = comment.getElementsByClassName('btnDelComment');
        for(const btn of btns){
          console.log(btn)
          btn.addEventListener("click", (e) => {
              let parentDiv = e.target.parentElement.parentElement;
              parentDiv.getElementsByClassName('_method')[0].value = "DELETE";
              parentDiv.submit(); // parentDiv is actually a form
          });
          btn.style.display = "block";
        }
      }

    } else {
      document.getElementById('comment_section').style.display = "none";
      document.getElementById('username').innerHTML = "none";
    }
    

} catch (e) {
    // Display errors in the console
    console.log(e);
  }
}; 

const showAdminOptions = async () => {
  try {    
    console.log("adminOptions");
    // Get the access token from the Auth0 client
    const token = await auth0.getTokenSilently();   

    // Make the call to the API, setting the token
    // in the Authorization header
    const response = await fetch(`${serverUri}/api/admin`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    // Fetch the JSON result
    const responseData = await response.json();

    if(responseData){
      // user is authorized - admin

      let scores = document.getElementsByClassName('score')
      for(const score of scores){
        let btns = score.getElementsByClassName('btnEditScore');
        for(const btn of btns){
          btn.style.display = "block";
          btn.addEventListener("click", (e) => {
            e.target.style.display = "none"; // Hide edit button
            let parentDiv= e.target.parentElement;
            parentDiv.style = "border-width: 3px; border-style:solid;" // make it obvious the text is editable
            parentDiv.setAttribute("contenteditable", true); // make the score editable
            
            let saveButton = parentDiv.getElementsByClassName('btnSaveScore')[0]
            saveButton.style.display = "block"; // show save button
            saveButton.addEventListener("click", (e) => {
              let parentDiv = e.target.parentElement;
              parentDiv.setAttribute("contenteditable", false);
              parentDiv.getElementsByClassName('editedScore')[0].value = parentDiv.getElementsByClassName('value-of-cell')[0].innerHTML.trim();
              parentDiv.parentElement.getElementsByClassName('edit-score-form')[0].submit();
            })
          });
          btn.style.display = "block";
        }
        btns = comment.getElementsByClassName('btnDelComment');
        for(const btn of btns){
          console.log(btn)
          btn.addEventListener("click", (e) => {
              let parentDiv = e.target.parentElement.parentElement;
              parentDiv.getElementsByClassName('_method')[0].value = "DELETE";
              parentDiv.submit(); // parentDiv is actually a form
          });
          btn.style.display = "block";
        }
      }

      document.getElementById('user').style.display = "block";
      document.getElementById('user').innerHTML = `<b>You are logged in as an admin. ${JSON.parse(responseData).email}</b>`
      document.getElementById('comment_section').style.display = "block";

      delBtns = document.getElementsByClassName('btnDelComment');
      for(const btn of delBtns) {
        btn.style.display = "block";
        btn.addEventListener("click", (e) => {
          let parentDiv = e.target.parentElement.parentElement;
          parentDiv.getElementsByClassName('_method')[0].value = "DELETE";
          parentDiv.submit(); // parentDiv is actually a form
      });
      }
      
    } else {
      console.log("isn't authorized")
      var btns = document.getElementsByClassName("btnEditScore");
      for (const btn of btns) {
        btn.style.display = "none";
      }
    }
    

} catch (e) {
    // Display errors in the console
    console.log(e);    
  }
}; 

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

const logout = async () => {
    await auth0.logout({
        returnTo: window.location.origin
    });
};

window.onload = async () => {
    //showCommentSection();
    document.getElementById('btnLogout').addEventListener("click", logout);
    document.getElementById('btnLogin').addEventListener("click", login);

    await configureClient();
    await initialLogin();

    const isAuthenticated = await auth0.isAuthenticated();
    updateUI();
    if (isAuthenticated) {
        // show the gated content
        showMemberOptions();
        showAdminOptions();
        return;
    }

    //must be included to handle redirect!
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {

        // Process the login state
        await auth0.handleRedirectCallback();
        
        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
  };

  const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    document.getElementById('btnLogin').style.display = isAuthenticated ? "none" : "block" ;
    document.getElementById('btnLogout').style.display = isAuthenticated ? "block" : "none" ;
  }

/*   // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btns = document.getElementsByClassName("btnEditScore");
  var btns2 = document.getElementsByClassName("btnEditComment");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  for (const btn of btns) {
    btn.onclick = function() {
      modal.style.display = "block";
    }
  }
  for (const btn of btns2) {
    btn.onclick = function() {
      modal.style.display = "block";
    }
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  } */




