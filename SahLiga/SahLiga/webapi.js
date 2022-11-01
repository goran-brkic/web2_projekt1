const express = require('express');
const cors = require('cors');
const { auth } = require("express-oauth2-jwt-bearer");
const jwtAuthz = require('express-jwt-authz'); // not used, auth0 trial
const axios = require('axios');



const app = express();
app.use(cors());

var authServer = 'https://dev-7xjdvaspwt881ruz.eu.auth0.com';

const checkAdminPermissions = jwtAuthz(['delete:comment', 'edit:result', 'post:result', 'read:comments'], { 
    customScopeKey: 'permissions', 
    customUserKey: 'auth',
    checkAllScopes: 'true'
});

const checkMemberPermissions = jwtAuthz(['read:comments', 'post:comment', 'edit:comment', 'delete:comment'], { 
    customScopeKey: 'permissions', 
    customUserKey: 'auth',
    checkAllScopes: 'true'
});

const permissionsMiddleware = (req, res, next) => {
    // used to move permissions outside of paylod
    // jwtAuthz doesn't know to look inside payload therefore checkPermissions doesn't work properly without this
    const payload = req.auth.payload
    Object.assign(req.auth, {permissions: Array.from(payload.permissions)});
    next();
}


const checkJwt = auth({
    audience: 'https://sahliga.com',
    issuerBaseURL: `${authServer}`,
    tokenSigningAlg: "RS256"
});


app.use(checkJwt);

app.get('/api/member', checkJwt, permissionsMiddleware, checkMemberPermissions, async (req, res) => {
    const accesstoken = req.auth.token;
    try{
        const userInfoResponse = await axios.post(`${authServer}/userinfo`, {},  {
                                                        headers : {
                                                            Authorization : `Bearer ${accesstoken}`
                                                        }}); 
        const user = userInfoResponse.data;
        res.json(JSON.stringify(user)); // if this returns, the user has the required authorization
    }
    catch(err) {
        console.log(err);
    }
});

app.get('/api/admin', checkJwt, permissionsMiddleware, checkAdminPermissions, async (req, res) => {
    const accesstoken = req.auth.token;
    try{
        const userInfoResponse = await axios.post(`${authServer}/userinfo`, {},  {
                                                        headers : {
                                                            Authorization : `Bearer ${accesstoken}`
                                                        }}); 
        const user = userInfoResponse.data;
        res.json(JSON.stringify(user)); // if this returns, the user has the required authorization
    }
    catch(err) {
        console.log(err);
    }
});

app.use(function(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      return res.status(401).send({ msg: "Invalid token" });
    }
  
    next(err, req, res);
});

    
const externalUrl = "not_used";
const port =  4091;
const hostname = '127.0.0.1';
if (externalUrl) {
    app.listen(port, hostname, () => {
        console.log(`Web API locally running at http://${hostname}:${port} and from outside on ${externalUrl}:4091`);
    });
    
} else {
    app.listen(port, hostname, () => {
        console.log(`Web API running at http://${hostname}:${port}/`);
    });
    
}
