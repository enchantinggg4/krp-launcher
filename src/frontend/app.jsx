import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MainApp } from './container/MainApp.jsx';
import { SWRConfig } from 'swr';
import { api } from './config.js';
import store from './store.js';



const root = createRoot(document.querySelector("#body"));

root.render(
    <SWRConfig value={{
        fetcher(key, params) {
            console.log(key, params)
            return api.get(key, params).then(it => it.data)
        }
    }}>
        <MainApp />
    </SWRConfig>
);
