import React from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthorizationServiceConfiguration, FetchRequestor, AuthorizationNotifier, RedirectRequestHandler, AuthorizationRequest, LocalStorageBackend, BasicQueryStringUtils, DefaultCrypto, BaseTokenRequestHandler, TokenRequest } from '@openid/appauth';

class MyStringUtils extends BasicQueryStringUtils {
  constructor() {
    super();
    this.parse = (input) => super.parse(input, false);
  }
}

function App() {

  const openIdUrl = 'https://accounts.google.com';
  const clientId = 'PUT CLIENT ID HERE';
  const redirectUrl = 'http://localhost:3000';

  let openIdConfiguration;
  const fetchConfiguration = () => {
    AuthorizationServiceConfiguration.fetchFromIssuer(openIdUrl, new FetchRequestor())
      .then(response => {
        openIdConfiguration = response;
        console.log(openIdConfiguration);
      });
  }

  let code;
  let stateRequest;
  const notifier = new AuthorizationNotifier();
  const authorizationHandler = new RedirectRequestHandler(new LocalStorageBackend(), new MyStringUtils(), window.location, new DefaultCrypto());
  authorizationHandler.setAuthorizationNotifier(notifier);
  notifier.setAuthorizationListener((request, response, error) => {
    console.log('Authorization request complete', request, response, error);
    code = response.code;
    stateRequest = request;
  });

  const performAuthRequest = () => {
    let request = new AuthorizationRequest({
      client_id: clientId,
      redirect_uri: redirectUrl,
      scope: 'openid',
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: undefined,
      extras: { 'prompt': 'consent', 'access_type': 'offline' }
    });

    authorizationHandler.performAuthorizationRequest(openIdConfiguration, request);
  };

  const getToken = () => {
    let request;
    const tokenHandler = new BaseTokenRequestHandler(new FetchRequestor(), new MyStringUtils());
    if (code) {
      let extras;
      if (stateRequest && stateRequest.internal) {
        extras = {};
        extras['code_verifier'] = stateRequest.internal['code_verifier'];
      }

      request = new TokenRequest({
        client_id: clientId,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
        code: code,
        refresh_token: undefined,
        extras: extras
      });
    }

    tokenHandler.performTokenRequest(openIdConfiguration, request).then(response => console.log(response));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          <button onClick={() => fetchConfiguration()}>Fetch Configuration</button>
          <button onClick={() => performAuthRequest()}>Authenticate</button>
          <button onClick={() => authorizationHandler.completeAuthorizationRequestIfPossible()}>Try complete</button>
          <button onClick={() => getToken()}>Get Token</button>
        </div>
      </header>

    </div>
  );
}

export default App;
