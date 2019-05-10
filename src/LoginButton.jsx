import React from 'react';
import { useState, useEffect } from 'react';
import { AuthorizationServiceConfiguration, FetchRequestor, RedirectRequestHandler, AuthorizationRequest, LocalStorageBackend, BasicQueryStringUtils, DefaultCrypto } from '@openid/appauth';

class MyStringUtils extends BasicQueryStringUtils {
    constructor() {
        super();
        this.parse = (input) => super.parse(input, false);
    }
}

const LoginButton = () => {
    const openIdUrl = 'https://accounts.google.com';
    const clientId = ;
    const redirectUrl = 'http://localhost:3000/auth-redirect';

    const [openIdConfiguration, setOpenIdConfiguration] = useState();

    useEffect(() => {
        AuthorizationServiceConfiguration.fetchFromIssuer(openIdUrl, new FetchRequestor())
            .then(setOpenIdConfiguration);
    }, []);

    const authorizationHandler = new RedirectRequestHandler(new LocalStorageBackend(), new MyStringUtils(), window.location, new DefaultCrypto());

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

    return (
        <button onClick={performAuthRequest}>Login</button>
    );
};

export default LoginButton;