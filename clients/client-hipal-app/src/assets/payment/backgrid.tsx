import React from 'react'

const Backgrid = ({color}:{color:string}) => {
    return (
        <svg width="124" height="170" viewBox="0 0 124 170" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M10.1826 0L10.1826 175M30.9589 0L30.9589 175M51.7352 
            0L51.7352 175M72.5114 0L72.5114 175M93.2877 0L93.2877 175M114.064 
            0L114.064 175M134.84 0L134.84 175M155.616 0L155.616 175M170 15.1826L-5
             15.1826M170 35.9589L-5 35.9589M170 56.7352L-5 56.7351M170 77.5114L-5
              77.5114M170 98.2877L-5 98.2877M170 119.064L-5 119.064M170 139.84L-5 
              139.84M170 160.616L-5 160.616" stroke={`${color}`} stroke-opacity="0.3"
                stroke-width="0.5" />
        </svg>
    )
}

export default Backgrid