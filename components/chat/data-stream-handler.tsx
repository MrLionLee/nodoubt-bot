"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";


export function DataStreamHandler({id}: {id:string}) {
    // 只有
    const {data:dataStream} = useChat({id});
    const lastProcessedIndex = useRef(-1)
    useEffect(() => {
        if(!dataStream?.length) return;

        const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
        lastProcessedIndex.current = dataStream.length - 1;

        console.log('dataStream', dataStream);
        console.log('newDeltas', newDeltas);

    }, [dataStream]);

    return null
}