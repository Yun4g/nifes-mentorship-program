import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();


function GlobalState({ children }) {
    const [state, setState] = useState({});

    return (
        <GlobalContext.Provider value={{ state, setState }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalState;