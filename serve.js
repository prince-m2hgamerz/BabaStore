var h=require('http'),f=require('fs'),p=require('path'),dir=p.resolve('.');
h.createServer(function(q,r){
  var u=q.url.replace(/\/$/,'/space-landing.html');
  var fp=p.join(dir,u);
  if(!f.existsSync(fp)){r.writeHead(404);r.end(fp);return;}
  var ext={'html':'text/html','js':'application/javascript','css':'text/css'}[p.extname(fp).slice(1)]||'text/plain';
  r.writeHead(200,{'Content-Type':ext});
  f.createReadStream(fp).pipe(r);
}).listen(56718,function(){console.log('http://localhost:56718/space-landing.html')});
