/**
 * Contains general-purpose React hooks that can be utilized by components.
 */

 import { useLayoutEffect, useState } from 'react';
 
 export const useWindowSize = () => {
     const [size, setSize] = useState([0, 0]);
     if (typeof window !== 'undefined') {
         useLayoutEffect(() => {
             function updateSize() {
                 setSize([window.innerWidth, window.innerHeight]);
             }
             window.addEventListener('resize', updateSize);
             updateSize();
             return () => window.removeEventListener('resize', updateSize);
         }, []);
     }
     return {width: size[0], height: size[1]};
 }