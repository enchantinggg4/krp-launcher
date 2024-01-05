import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MainApp } from './container/MainApp.jsx';

const root = createRoot(document.querySelector("#body"));
root.render(
    <MainApp />
);
