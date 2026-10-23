(function(){
  if(window.__dmSpaNavInstalled)return;
  window.__dmSpaNavInstalled=true;
  const routes=['index.html','products.html','portfolio.html','/'];
  let busy=false;
  function localRoute(url){return url.origin===location.origin&&routes.some(r=>url.pathname.endsWith(r));}
  async function render(url,addHistory,restoreState){
    if(busy)return;
    busy=true;
    try{
      const response=await fetch(url.href,{headers:{'X-DM-Navigation':'1'}});
      if(!response.ok)throw new Error('Navigation failed');
      const html=await response.text();
      const parsed=new DOMParser().parseFromString(html,'text/html');
      if(addHistory){
        history.pushState({dmSpa:true,scrollY:window.scrollY},'',url.pathname+url.search+url.hash);
      }
      document.title=parsed.title||document.title;
      document.head.innerHTML=parsed.head.innerHTML;
      const nextBody=parsed.body.cloneNode(true);
      document.body.replaceWith(nextBody);
      const scripts=Array.from(document.body.querySelectorAll('script'));
      for(const oldScript of scripts){
        const script=document.createElement('script');
        for(const attr of oldScript.attributes)script.setAttribute(attr.name,attr.value);
        if(oldScript.src){
          await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject;oldScript.replaceWith(script);});
        }else{
          script.textContent=oldScript.textContent;
          oldScript.replaceWith(script);
        }
      }
      if(url.hash){
        const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if(target)target.scrollIntoView({block:'start'});
        else window.scrollTo(0,0);
      }else if(restoreState&&Number.isFinite(restoreState.scrollY)){
        window.scrollTo(0,restoreState.scrollY);
      }else window.scrollTo(0,0);
    }catch(error){
      console.error('DM navigation fallback:',error);
      location.href=url.href;
    }finally{busy=false;}
  }
  document.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href]');
    if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
    const url=new URL(link.href,location.href);
    if(!localRoute(url))return;
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash){
      event.preventDefault();
      history.pushState({dmSpa:true,scrollY:window.scrollY},'',url.pathname+url.search+url.hash);
      const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
      else window.scrollTo({top:0,behavior:'smooth'});
      return;
    }
    event.preventDefault();
    render(url,true,null);
  });
  window.addEventListener('popstate',function(event){
    render(new URL(location.href),false,event.state||null);
  });
})();