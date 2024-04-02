const ScorecardSvg = (scorecardTier: number, disableScorecardIcon: boolean) => {
  if (scorecardTier === 2) {
    return (
      <svg data-testid='gold-card' width='70' height='44' viewBox='0 0 70 44' fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M0 3.66667C0 1.64162 1.69406 0 3.78378 0H66.2162C68.306 0 70 1.64162 70 3.66667V40.3333C70 42.3584 68.306 44 66.2162 44H3.78378C1.69406 44 0 42.3584 0 40.3333V3.66667Z'
          fill={disableScorecardIcon ? '#C8C8C8' : '#BAA86D'}/>
        <path
          d='M4 18.405H5.66259V20.1381L6.22418 20.6824H7.72423L8.27842 20.1381V18.097L7.9459 17.7032L5.08623 16.6003L4.02955 15.3542V12.3177L5.3892 11H8.52226L9.88191 12.3177V14.4875H8.2193V12.8619L7.65771 12.3177H6.22418L5.66259 12.8619V14.8099L5.99511 15.1967L8.85478 16.278L9.91146 17.5241V20.6824L8.55184 22H5.35963L4 20.6824V18.405Z'
          fill='white'/>
        <path
          d='M15.3352 18.1399H16.9978V20.6824L15.6308 22H12.4534L11.0938 20.6824V12.3177L12.4534 11H15.6308L16.9978 12.3177V14.6667H15.3352V12.8619L14.7736 12.3177H13.3179L12.7563 12.8619V20.1381L13.3179 20.6824H14.7736L15.3352 20.1381V18.1399Z'
          fill='white'/>
        <path
          d='M19.8652 12.8619V20.1381L20.4269 20.6824H21.986L22.5475 20.1381V12.8619L21.986 12.3177H20.4269L19.8652 12.8619ZM19.5623 22L18.2026 20.6824V12.3177L19.5623 11H22.8506L24.2101 12.3177V20.6824L22.8506 22H19.5623Z'
          fill='white'/>
        <path
          d='M27.2618 22H25.5918V11H30.0919L31.4516 12.3177V15.7194L30.3949 16.7506L31.4516 17.7747V22H29.789V17.8821L29.2717 17.3809H27.2618V22ZM27.2618 12.3177V16.1205H29.2717L29.789 15.6191V12.8619L29.2274 12.3177H27.2618Z'
          fill='white'/>
        <path d='M32.8184 22V11H37.8578V12.3965H34.4883V15.6765H37.6361V17.0729H34.4883V20.6036H37.8578V22H32.8184Z'
          fill='white'/>
        <path
          d='M43.2375 18.1399H44.9001V20.6824L43.5332 22H40.3558L38.9961 20.6824V12.3177L40.3558 11H43.5332L44.9001 12.3177V14.6667H43.2375V12.8619L42.676 12.3177H41.2204L40.6587 12.8619V20.1381L41.2204 20.6824H42.676L43.2375 20.1381V18.1399Z'
          fill='white'/>
        <path
          d='M50.6044 22L50.0281 19.0351H47.6413L47.0649 22H45.5205L47.7448 11H50.0724L52.3113 22H50.6044ZM48.8162 13.0268L47.9221 17.6172H49.7546L48.8605 13.0268H48.8162Z'
          fill='white'/>
        <path
          d='M54.9717 22H53.3018V11H57.8018L59.1615 12.3177V15.7194L58.1049 16.7506L59.1615 17.7747V22H57.4989V17.8821L56.9817 17.3809H54.9717V22ZM54.9717 12.3177V16.1205H56.9817L57.4989 15.6191V12.8619L56.9374 12.3177H54.9717Z'
          fill='white'/>
        <path
          d='M62.1983 12.3177V20.6824H64.2082L64.7698 20.1381V12.8619L64.2082 12.3177H62.1983ZM60.5283 22V11H65.0726L66.4323 12.3177V20.6824L65.0726 22H60.5283Z'
          fill='white'/>
        <path
          d='M27.8242 28.7471H27.0381V26.9834L26.2588 26.1973H24.3516L23.5654 26.9834V34.5166L24.3516 35.3027H26.2588L27.0381 34.5166V31.5498H25.0967V30.8457H27.8242V34.7832L26.6074 36H24.0029L22.7861 34.7832V26.7168L24.0029 25.5H26.6074L27.8242 26.7168V28.7471ZM30.2236 26.9834V34.5166L31.0098 35.3027H32.958L33.7373 34.5166V26.9834L32.958 26.1973H31.0098L30.2236 26.9834ZM30.6611 36L29.4443 34.7832V26.7168L30.6611 25.5H33.3066L34.5234 26.7168V34.7832L33.3066 36H30.6611ZM36.2119 36V25.5H36.998V35.3027H40.2998V36H36.2119ZM42.4805 26.1973V35.3027H45.0371L45.8232 34.5166V26.9834L45.0371 26.1973H42.4805ZM41.6943 36V25.5H45.3926L46.6094 26.7168V34.7832L45.3926 36H41.6943Z'
          fill='white'/>
      </svg>
    )
  } else if (scorecardTier === 3) {
    return (
      <svg data-testid='card-holder-card' width='70' height='44' viewBox='0 0 70 44' fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <mask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='70' height='44'>
          <path
            d='M0 3.66667C0 1.64162 1.69406 0 3.78378 0H66.2162C68.306 0 70 1.64162 70 3.66667V40.3333C70 42.3584 68.306 44 66.2162 44H3.78378C1.69406 44 0 42.3584 0 40.3333V3.66667Z'
            fill='#BAA86D'/>
        </mask>
        <g mask='url(#mask0)'>
          <rect x='-5.32568' y='-1.71527' width='75.9385' height='44.7487'
            transform='rotate(0.943434 -5.32568 -1.71527)' fill={disableScorecardIcon ? '#C8C8C8' : 'black'}/>
          <path
            d='M19.5059 16.5684H21.0439V18.2227L21.5635 18.7422H22.9512L23.4639 18.2227V16.2744L23.1562 15.8984L20.5107 14.8457L19.5332 13.6562V10.7578L20.791 9.5H23.6895L24.9473 10.7578V12.8291H23.4092V11.2773L22.8896 10.7578H21.5635L21.0439 11.2773V13.1367L21.3516 13.5059L23.9971 14.5381L24.9746 15.7275V18.7422L23.7168 20H20.7637L19.5059 18.7422V16.5684ZM29.9922 16.3154H31.5303V18.7422L30.2656 20H27.3262L26.0684 18.7422V10.7578L27.3262 9.5H30.2656L31.5303 10.7578V13H29.9922V11.2773L29.4727 10.7578H28.126L27.6064 11.2773V18.2227L28.126 18.7422H29.4727L29.9922 18.2227V16.3154ZM34.1826 11.2773V18.2227L34.7021 18.7422H36.1445L36.6641 18.2227V11.2773L36.1445 10.7578H34.7021L34.1826 11.2773ZM33.9023 20L32.6445 18.7422V10.7578L33.9023 9.5H36.9443L38.2021 10.7578V18.7422L36.9443 20H33.9023ZM41.0254 20H39.4805V9.5H43.6436L44.9014 10.7578V14.0049L43.9238 14.9893L44.9014 15.9668V20H43.3633V16.0693L42.8848 15.5908H41.0254V20ZM41.0254 10.7578V14.3877H42.8848L43.3633 13.9092V11.2773L42.8438 10.7578H41.0254ZM46.166 20V9.5H50.8281V10.833H47.7109V13.9639H50.623V15.2969H47.7109V18.667H50.8281V20H46.166Z'
            fill='white'/>
          <path
            d='M13.6406 33H12.8545V22.5H16.4912L17.7148 23.7168V27.1484L16.8467 28.0166L17.7148 28.8848V33H16.9287V29.0967L16.1973 28.3652H13.6406V33ZM13.6406 23.1973V27.668H16.1973L16.9287 26.9365V23.9834L16.1426 23.1973H13.6406ZM19.4033 33V22.5H23.7305V23.1973H20.1895V27.2168H23.5186V27.9209H20.1895V32.3027H23.7305V33H19.4033ZM30.416 33L28.8779 24.2363H28.8506L27.3125 33H26.4307L24.749 22.5H25.5352L26.916 31.332H26.9502L28.502 22.5H29.2539L30.8125 31.332H30.8398L32.2275 22.5H32.8975L31.2158 33H30.416ZM38.0312 33L37.2656 29.541H34.6133L33.8477 33H33.0889L35.4541 22.5H36.4658L38.8447 33H38.0312ZM35.9326 23.6211L34.7705 28.8438H37.1084L35.9463 23.6211H35.9326ZM40.8203 33H40.0342V22.5H43.6709L44.8945 23.7168V27.1484L44.0264 28.0166L44.8945 28.8848V33H44.1084V29.0967L43.377 28.3652H40.8203V33ZM40.8203 23.1973V27.668H43.377L44.1084 26.9365V23.9834L43.3223 23.1973H40.8203ZM47.3691 23.1973V32.3027H49.9258L50.7119 31.5166V23.9834L49.9258 23.1973H47.3691ZM46.583 33V22.5H50.2812L51.498 23.7168V31.7832L50.2812 33H46.583ZM53.002 29.5957H53.7881V31.5166L54.5742 32.3027H56.4199L57.2061 31.5166V29.377L56.7002 28.6592L53.8701 27.374L53.0566 26.2256V23.7168L54.2803 22.5H56.7139L57.9307 23.7168V25.7471H57.1445V23.9834L56.3652 23.1973H54.6152L53.8291 23.9834V26L54.335 26.7109L57.165 27.9893L57.9717 29.1377V31.7832L56.7549 33H54.2188L53.002 31.7832V29.5957Z'
            fill='white'/>
        </g>
      </svg>
    )
  } else {
    return (
      <svg data-testid='basic-card' width='70' height='44' viewBox='0 0 70 44' fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M0 3.66667C0 1.64162 1.69406 0 3.78378 0H66.2162C68.306 0 70 1.64162 70 3.66667V40.3333C70 42.3584 68.306 44 66.2162 44H3.78378C1.69406 44 0 42.3584 0 40.3333V3.66667Z'
          fill={disableScorecardIcon ? '#C8C8C8' : '#006554'}/>
        <path
          d='M3.78369 23.905H5.44629V25.6381L6.00788 26.1824H7.50792L8.06211 25.6381V23.597L7.72959 23.2032L4.86992 22.1003L3.81324 20.8542V17.8177L5.17289 16.5H8.30596L9.6656 17.8177V19.9875H8.00299V18.3619L7.4414 17.8177H6.00788L5.44629 18.3619V20.3099L5.7788 20.6967L8.63848 21.778L9.69515 23.0241V26.1824L8.33553 27.5H5.14332L3.78369 26.1824V23.905Z'
          fill='white'/>
        <path
          d='M15.1189 23.6399H16.7815V26.1824L15.4145 27.5H12.2371L10.8774 26.1824V17.8177L12.2371 16.5H15.4145L16.7815 17.8177V20.1667H15.1189V18.3619L14.5573 17.8177H13.1016L12.54 18.3619V25.6381L13.1016 26.1824H14.5573L15.1189 25.6381V23.6399Z'
          fill='white'/>
        <path
          d='M19.6489 18.3619V25.6381L20.2106 26.1824H21.7697L22.3312 25.6381V18.3619L21.7697 17.8177H20.2106L19.6489 18.3619ZM19.346 27.5L17.9863 26.1824V17.8177L19.346 16.5H22.6343L23.9938 17.8177V26.1824L22.6343 27.5H19.346Z'
          fill='white'/>
        <path
          d='M27.0455 27.5H25.3755V16.5H29.8755L31.2352 17.8177V21.2194L30.1786 22.2506L31.2352 23.2747V27.5H29.5727V23.3821L29.0554 22.8809H27.0455V27.5ZM27.0455 17.8177V21.6205H29.0554L29.5727 21.1191V18.3619L29.0111 17.8177H27.0455Z'
          fill='white'/>
        <path d='M32.6021 27.5V16.5H37.6415V17.8965H34.272V21.1765H37.4198V22.5729H34.272V26.1036H37.6415V27.5H32.6021Z'
          fill='white'/>
        <path
          d='M43.0212 23.6399H44.6838V26.1824L43.3169 27.5H40.1395L38.7798 26.1824V17.8177L40.1395 16.5H43.3169L44.6838 17.8177V20.1667H43.0212V18.3619L42.4597 17.8177H41.0041L40.4424 18.3619V25.6381L41.0041 26.1824H42.4597L43.0212 25.6381V23.6399Z'
          fill='white'/>
        <path
          d='M50.3881 27.5L49.8118 24.5351H47.425L46.8485 27.5H45.3042L47.5285 16.5H49.8561L52.095 27.5H50.3881ZM48.5999 18.5268L47.7058 23.1172H49.5383L48.6441 18.5268H48.5999Z'
          fill='white'/>
        <path
          d='M54.7554 27.5H53.0854V16.5H57.5855L58.9452 17.8177V21.2194L57.8886 22.2506L58.9452 23.2747V27.5H57.2826V23.3821L56.7654 22.8809H54.7554V27.5ZM54.7554 17.8177V21.6205H56.7654L57.2826 21.1191V18.3619L56.7211 17.8177H54.7554Z'
          fill='white'/>
        <path
          d='M61.982 17.8177V26.1824H63.9919L64.5534 25.6381V18.3619L63.9919 17.8177H61.982ZM60.312 27.5V16.5H64.8563L66.216 17.8177V26.1824L64.8563 27.5H60.312Z'
          fill='white'/>
      </svg>
    )
  }
}

export default ScorecardSvg