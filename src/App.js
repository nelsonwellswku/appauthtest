import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import LoginButton from './LoginButton';
import AuthRedirect from './AuthRedirect';

function App() {

  return (
    <Router>
      <Route path='/home' render={() => <div className="App">
        <header className="App-header">

          <div>
            <LoginButton />
          </div>
        </header>

      </div>} />
      <Route path='/auth-redirect' component={AuthRedirect} />
    </Router>

  );
}

export default App;
