import {  useEffect, useRef } from "react";


export function useScrollToBottom<T extends HTMLElement>(){
    const containerRef =useRef<T>(null);
    const endRef =useRef<T>(null);
    useEffect(() => {
        const container = containerRef.current;
        const end = endRef.current;

        if(container && end) {
            const observer = new MutationObserver(() => {
                end?.scrollIntoView({behavior: 'instant', block: 'end'});
            })
    
            observer.observe(container,{
                childList: true,
                subtree: true, // 监听子元素的变化，包括子元素的子元素
                attributes: true, // 监听属性的变化
                characterData: true, // 监听文本内容的变化
            })
    
            return () => {
                observer.disconnect();
            }
        }
    },[])


    return [containerRef, endRef];
}