/** Silueta central tipo amonita (diseño de referencia). */
export function HeroFossilSvg() {
  return (
    <div className="hero-fossil" aria-hidden>
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" fill="none">
        <g stroke="#c8820a" strokeWidth="1.5" fill="none">
          <circle cx="250" cy="250" r="230" strokeWidth="1" stroke="rgba(200,130,10,.3)" />
          <circle cx="250" cy="250" r="210" strokeWidth="0.5" stroke="rgba(200,130,10,.2)" />
          <path
            d="M250,250 Q480,250 480,20 Q480,-210 250,-210 Q20,-210 20,250 Q20,710 480,480 Q710,250 480,20"
            strokeWidth="2"
            stroke="rgba(200,130,10,.5)"
          />
          <path d="M250,250 Q420,250 420,80 Q420,-80 250,-80 Q80,-80 80,250 Q80,580 420,420" strokeWidth="1.5" />
          <path d="M250,250 Q360,250 360,140 Q360,30 250,30 Q140,30 140,250 Q140,470 360,360" strokeWidth="1.2" />
          <path d="M250,250 Q310,250 310,190 Q310,130 250,130 Q190,130 190,250 Q190,370 310,310" strokeWidth="1" />
          <path d="M250,250 Q280,250 280,220 Q280,190 250,190 Q220,190 220,250 Q220,310 280,280" strokeWidth="0.8" />
          <line x1="250" y1="250" x2="480" y2="250" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="250" y2="20" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="413" y2="87" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="413" y2="413" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="87" y2="413" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="87" y2="87" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="20" y2="250" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <line x1="250" y1="250" x2="250" y2="480" strokeWidth="0.6" stroke="rgba(200,130,10,.25)" />
          <path d="M460,170 Q470,190 475,210" strokeWidth="1.2" />
          <path d="M450,130 Q465,148 468,165" strokeWidth="1.2" />
          <path d="M430,100 Q447,118 453,134" strokeWidth="1.2" />
          <path d="M400,75 Q420,90 428,108" strokeWidth="1.2" />
          <path d="M355,58 Q378,70 388,88" strokeWidth="1.2" />
          <path d="M300,50 Q323,60 334,76" strokeWidth="1.2" />
          <path d="M40,310 Q35,290 30,268" strokeWidth="1.2" />
          <path d="M42,360 Q35,340 30,315" strokeWidth="1.2" />
          <path d="M55,405 Q45,385 38,360" strokeWidth="1.2" />
          <path d="M80,440 Q68,422 58,398" strokeWidth="1.2" />
          <circle cx="250" cy="250" r="18" fill="rgba(200,130,10,.08)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="8" fill="rgba(200,130,10,.15)" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
