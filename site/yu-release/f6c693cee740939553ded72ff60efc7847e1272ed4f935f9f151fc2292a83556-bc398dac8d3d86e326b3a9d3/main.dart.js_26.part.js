((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bdD:function bdD(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bdE:function bdE(){},a_X:function a_X(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aql:function aql(){},Oy:function Oy(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ri$=d
_.eP$=e
_.bw$=f
_.a=null},aoZ:function aoZ(d,e,f,g,h,i,j){var _=this
_.ad=d
_.y1=e
_.y2=f
_.eK$=g
_.b5$=h
_.eS$=i
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
dG9(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kl:w}else x=j
return new A.FO(f,new B.Ce(g,h,!0,!0,!0,0,B.aLl(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.k7,e,w,w,C.y,C.a8,w)},
FO:function FO(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
aqk:function aqk(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bdD.prototype={
aD3(d){var x=this.c
return d.GB(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.o.aS(B.e(["scrollOffset: "+B.I(x.a),"crossAxisOffset: "+B.I(x.b),"mainAxisExtent: "+B.I(x.c),"crossAxisExtent: "+B.I(x.d)],y.x),", ")+")"}}
A.bdE.prototype={}
A.a_X.prototype={
aDn(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f0(d/x)-1)
return 0},
aV2(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_q(d){var x=this,w=x.a,v=C.r.ai(d,w)
return new A.bdD(C.r.hx(d,w)*x.b,x.aV2(v*x.c),x.d,x.e)},
auY(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hx(d-1,this.a)+1)-(x-this.d)}}
A.aql.prototype={}
A.Oy.prototype={
p(d){return"crossAxisOffset="+B.I(this.w)+"; "+this.aIB(0)}}
A.aoZ.prototype={
jT(d){if(!(d.b instanceof A.Oy))d.b=new A.Oy(!1,null,null)},
saDO(d){var x=this
if(x.ad===d)return
if(B.ar(d)!==B.ar(x.ad)||d.ph(x.ad))x.aM()
x.ad=d},
GP(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dL(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.aq.prototype.gaH.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ad.QN(a8)
t=u.b
s=t>1e-10?u.a*C.t.hx(w,t):0
r=isFinite(v)?u.aDn(v):a7
if(a6.b5$!=null){q=a6.auB(s)
a6.CX(q,r!=null?a6.auC(r):0)}else a6.CX(0,0)
p=u.a_q(s)
if(a6.b5$==null)if(!a6.a6R(s,p.a)){o=u.auY(a9.gGO())
a6.dy=B.ow(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D6()
return}n=p.a
m=n+p.c
t=a6.b5$
t.toString
t=t.b
t.toString
l=y.c
t=l.a(t).b
t.toString
k=t-1
t=y.t
j=a7
for(;k>=s;--k){i=u.a_q(k)
h=i.c
g=a6.axV(a8.GB(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b5$
h.toString
h.l_(p.aD3(a8))
j=a6.b5$
h=j.b
h.toString
t.a(h)
h.a=n
h.w=p.b}h=j.b
h.toString
h=l.a(h).b
h.toString
k=h+1
h=B.X(a6).l("bF.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_q(k)
e=i.c
a0=a8.GB(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bw$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axT(a0,j)
if(g==null){d=!0
break}}else g.l_(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.eS$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a8U(a8,s,t,n,m)
a4=a6.GK(a8,Math.min(x,n),m)
a5=a6.N8(a8,n,m)
a6.dy=B.ow(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D6()}}
A.FO.prototype={
aum(d){return new A.aqk(this.to,this.x1,null)}}
A.aqk.prototype={
c0(d){var x=new A.aoZ(this.f,y.v.a(d),B.V(y.e,y.g),0,null,null,B.bq())
x.c_()
return x},
c7(d,e){e.saDO(this.f)},
a8T(d,e,f,g,h){var x
this.aIC(d,e,f,g,h)
x=this.f.QN(d).auY(this.d.gHs())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bdD,A.bdE,A.aql])
w(A.a_X,A.bdE)
w(A.Oy,B.ki)
w(A.aoZ,B.vO)
w(A.FO,B.TQ)
w(A.aqk,B.ts)})()
B.dE(b.typeUniverse,JSON.parse('{"Oy":{"ki":[],"yP":[],"j5":["au"],"rZ":[],"h1":[]},"aoZ":{"vO":[],"f7":[],"bF":["au","ki"],"aq":[],"bD":[],"bF.1":"ki","bF.0":"au"},"FO":{"az":[],"M":[]},"aqk":{"ts":[],"bx":[],"M":[]}}'))
var y={x:B.am("Q<N>"),g:B.am("au"),z:B.am("qR"),t:B.am("Oy"),v:B.am("Cf"),c:B.am("ki"),e:B.am("T")}};
(a=>{a["dkQxgmuj0BPxBL/mSvpXxBADUQA="]=a.current})($__dart_deferred_initializers__);