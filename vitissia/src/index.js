import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals';

import './index.css'; // Vos styles personnalisés
import './styles.css'; // Autres styles personnalisés
//import './css/index.css';
import './css/syncfusion.css';
import './css/cardSync.css';

//import 'primereact/resources/primereact.min.css'; // Styles de base de PrimeReact
import 'primeicons/primeicons.css'; // Icônes de PrimeReact

//import 'primeflex/primeflex.css';
//import 'primereact/resources/primereact.css';
//import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
//import { PrimeReactProvider } from 'primereact/api';

import { registerLicense } from '@syncfusion/ej2-base';

// Remplace la clé ci-dessous par la tienne
//registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCe0xxWmFZfVtgdVVMYV9bRH9PMyBoS35Rc0VnWXhfcHVWR2NeVEV3VEBU');
registerLicense('ORg4AjUWIQA/Gnt2UlhhQlVMfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTX5adEZjUH1WcXdRR2da');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
