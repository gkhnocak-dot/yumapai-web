((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bdM:function bdM(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bdN:function bdN(){},a01:function a01(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aqs:function aqs(){},OC:function OC(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ng$=d
_.eV$=e
_.bb$=f
_.a=null},ap4:function ap4(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eC$=g
_.b_$=h
_.du$=i
_.b=_.dy=null
_.c=0
_.y=_.d=null
_.z=!0
_.Q=null
_.as=!1
_.at=null
_.ay=$
_.ch=j
_.CW=!1
_.cx=$
_.cy=!0
_.db=!1
_.dx=$},
dwm(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kj:w}else x=j
return new A.FQ(f,new B.vZ(g,h,!0,!0,!0,0,B.SD(),w),i,C.J,!1,d,w,x,w,k,w,0,w,w,h,C.k5,e,w,w,C.C,C.a7,w)},
FQ:function FQ(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
_.to=d
_.x1=e
_.dx=f
_.c=g
_.d=h
_.e=i
_.f=j
_.r=k
_.w=l
_.x=m
_.y=n
_.z=o
_.Q=p
_.as=q
_.at=r
_.ax=s
_.ay=t
_.ch=u
_.CW=v
_.cx=w
_.cy=x
_.a=a0},
aqr:function aqr(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bdM.prototype={
aDn(d){var x=this.c
return d.GF(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.n.aR(B.e(["scrollOffset: "+B.H(x.a),"crossAxisOffset: "+B.H(x.b),"mainAxisExtent: "+B.H(x.c),"crossAxisExtent: "+B.H(x.d)],y.x),", ")+")"}}
A.bdN.prototype={}
A.a01.prototype={
aDH(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.r.f1(d/x)-1)
return 0},
aVq(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_x(d){var x=this,w=x.a,v=C.q.ah(d,w)
return new A.bdM(C.q.hw(d,w)*x.b,x.aVq(v*x.c),x.d,x.e)},
avm(d){var x
if(d===0)return 0
x=this.b
return x*(C.q.hw(d-1,this.a)+1)-(x-this.d)}}
A.aqs.prototype={}
A.OC.prototype={
p(d){return"crossAxisOffset="+B.H(this.w)+"; "+this.aIV(0)}}
A.ap4.prototype={
js(d){if(!(d.b instanceof A.OC))d.b=new A.OC(!1,null,null)},
saE7(d){var x=this
if(x.ae===d)return
if(B.ar(d)!==B.ar(x.ae)||d.pf(x.ae))x.aM()
x.ae=d},
GT(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dI(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gaq.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QS(a8)
t=u.b
s=t>1e-10?u.a*C.r.hw(w,t):0
r=isFinite(v)?u.aDH(v):a7
if(a6.b_$!=null){q=a6.auZ(s)
a6.CZ(q,r!=null?a6.av_(r):0)}else a6.CZ(0,0)
p=u.a_x(s)
if(a6.b_$==null)if(!a6.a72(s,p.a)){o=u.avm(a9.gGS())
a6.dy=B.mG(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D8()
return}n=p.a
m=n+p.c
t=a6.b_$
t.toString
t=t.b
t.toString
l=y.c
t=l.a(t).b
t.toString
k=t-1
t=y.t
j=a7
for(;k>=s;--k){i=u.a_x(k)
h=i.c
g=a6.ayg(a8.GF(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b_$
h.toString
h.kV(p.aDn(a8))
j=a6.b_$
h=j.b
h.toString
t.a(h)
h.a=n
h.w=p.b}h=j.b
h.toString
h=l.a(h).b
h.toString
k=h+1
h=B.Y(a6).l("br.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_x(k)
e=i.c
a0=a8.GF(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bb$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.aye(a0,j)
if(g==null){d=!0
break}}else g.kV(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.du$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a93(a8,s,t,n,m)
a4=a6.CV(a8,Math.min(x,n),m)
a5=a6.GP(a8,n,m)
a6.dy=B.mG(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D8()}}
A.FQ.prototype={
auK(d){return new A.aqr(this.to,this.x1,null)}}
A.aqr.prototype={
c_(d){var x=new A.ap4(this.f,y.v.a(d),B.W(y.e,y.g),0,null,null,B.bq())
x.bZ()
return x},
c5(d,e){e.saE7(this.f)},
a92(d,e,f,g,h){var x
this.aIW(d,e,f,g,h)
x=this.f.QS(d).avm(this.d.gHw())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bdM,A.bdN,A.aqs])
w(A.a01,A.bdN)
w(A.OC,B.km)
w(A.ap4,B.vQ)
w(A.FQ,B.TV)
w(A.aqr,B.tw)})()
B.dq(b.typeUniverse,JSON.parse('{"OC":{"km":[],"yT":[],"j2":["au"],"t3":[],"h2":[]},"ap4":{"vQ":[],"es":[],"br":["au","km"],"ao":[],"bD":[],"br.1":"km","br.0":"au"},"FQ":{"ay":[],"L":[]},"aqr":{"tw":[],"bv":[],"L":[]}}'))
var y={x:B.aj("R<M>"),g:B.aj("au"),z:B.aj("pQ"),t:B.aj("OC"),v:B.aj("Ch"),c:B.aj("km"),e:B.aj("U")}};
(a=>{a["cpZADb4ebkkRnbYjkk1o5ALGS28="]=a.current})($__dart_deferred_initializers__);