import React, { useState, useEffect } from 'react';
import { AuthorizationServiceConfiguration, FetchRequestor, AuthorizationNotifier, RedirectRequestHandler, AuthorizationRequest, LocalStorageBackend, BasicQueryStringUtils, DefaultCrypto, BaseTokenRequestHandler, TokenRequest } from '@openid/appauth';

class MyStringUtils extends BasicQueryStringUtils {
    constructor() {
        super();
        this.parse = (input) => super.parse(input, false);
    }
}

const AuthRedirect = () => {
    const openIdUrl = 'https://accounts.google.com';
    const clientId = 
    const redirectUrl = 'http://localhost:3000/auth-redirect';

    const [code, setCode] = useState();
    const [stateRequest, setStateRequest] = useState();
    const [tokenRequestResponse, setTokenRequestResponse] = useState();



    useEffect(() => {
        AuthorizationServiceConfiguration.fetchFromIssuer(openIdUrl, new FetchRequestor())
            .then(config => {

                const notifier = new AuthorizationNotifier();
                const authorizationHandler = new RedirectRequestHandler(new LocalStorageBackend(), new MyStringUtils(), window.location, new DefaultCrypto());
                authorizationHandler.setAuthorizationNotifier(notifier);
                notifier.setAuthorizationListener((request, response, error) => {
                    console.log('Authorization request complete', request, response, error);
                    setCode(response.code);
                    setStateRequest(request);
                });

                authorizationHandler.completeAuthorizationRequestIfPossible();

                const tokenHandler = new BaseTokenRequestHandler(new FetchRequestor(), new MyStringUtils());
                if (code) {
                    let extras;
                    if (stateRequest && stateRequest.internal) {
                        extras = {};
                        extras['code_verifier'] = stateRequest.internal['code_verifier'];
                    }

                    if (extras && extras['code_verifier']) {
                        const request = new TokenRequest({
                            client_id: clientId,
                            redirect_uri: redirectUrl,
                            grant_type: 'authorization_code',
                            code: code,
                            refresh_token: undefined,
                            extras: extras
                        });

                        tokenHandler.performTokenRequest(config, request).then(response => {
                            console.log(response);
                            setTokenRequestResponse(response);
                            // here'd we'd take response and make a call to the user service
                            // when it returns, we set a state variable that is checked in the render method below
                            // if(userisSet) { return <Redirect path="/home" /> } or whatever
                        });
                    }
                }
            })
    }, [code, stateRequest]);

    return (
        <div>
            <pre>
                {JSON.stringify(tokenRequestResponse, null, 2)}
            </pre>
        </div>
    );
};

export default AuthRedirect;