import { createContext, useEffect, useState } from "react";

export const LevelContext = createContext();

const LevelContextProvider = (props) => {

    const [level, setLevel] = useState([]);

    useEffect(() => {
        
        const fetchLevel = async () => {
            fetch(`https://themecp.up.railway.app/api/level/*`)
                .then(res => res.json())
                .then(res => setLevel(res))
                .catch(err => console.error(err));
        }
    
        fetchLevel();
    }, [])

    const contextValue = {
        level,
    }

    return (
        <LevelContext.Provider value={contextValue}>
            {props.children}
        </LevelContext.Provider>
    )

}

export default LevelContextProvider