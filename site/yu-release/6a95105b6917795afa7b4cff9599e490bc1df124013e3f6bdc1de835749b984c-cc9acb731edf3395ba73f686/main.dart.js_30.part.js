((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bfO:function bfO(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bfP:function bfP(){},a0T:function a0T(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},arH:function arH(){},Pb:function Pb(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.iX$=d
_.ex$=e
_.bl$=f
_.a=null},aqk:function aqk(d,e,f,g,h,i,j){var _=this
_.af=d
_.y1=e
_.y2=f
_.eI$=g
_.b_$=h
_.eE$=i
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
dBv(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kB:w}else x=j
return new A.Gh(f,new B.wo(g,h,!0,!0,!0,0,B.Tk(),w),i,C.L,!1,d,w,x,w,k,w,0,w,w,h,C.km,e,w,w,C.C,C.a6,w)},
Gh:function Gh(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
arG:function arG(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[57],A)
A.bfO.prototype={
aEG(d){var x=this.c
return d.GX(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.m.aP(B.e(["scrollOffset: "+B.G(x.a),"crossAxisOffset: "+B.G(x.b),"mainAxisExtent: "+B.G(x.c),"crossAxisExtent: "+B.G(x.d)],y.x),", ")+")"}}
A.bfP.prototype={}
A.a0T.prototype={
aF_(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.u.eR(d/x)-1)
return 0},
aXb(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a0f(d){var x=this,w=x.a,v=C.q.aj(d,w)
return new A.bfO(C.q.hz(d,w)*x.b,x.aXb(v*x.c),x.d,x.e)},
awy(d){var x
if(d===0)return 0
x=this.b
return x*(C.q.hz(d-1,this.a)+1)-(x-this.d)}}
A.arH.prototype={}
A.Pb.prototype={
p(d){return"crossAxisOffset="+B.G(this.w)+"; "+this.aKf(0)}}
A.aqk.prototype={
jv(d){if(!(d.b instanceof A.Pb))d.b=new A.Pb(!1,null,null)},
saFq(d){var x=this
if(x.af===d)return
if(B.au(d)!==B.au(x.af)||d.pi(x.af))x.aL()
x.af=d},
H8(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dK(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gau.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.af.Rn(a8)
t=u.b
s=t>1e-10?u.a*C.u.hz(w,t):0
r=isFinite(v)?u.aF_(v):a7
if(a6.b_$!=null){q=a6.awb(s)
a6.D9(q,r!=null?a6.awc(r):0)}else a6.D9(0,0)
p=u.a0f(s)
if(a6.b_$==null)if(!a6.a7O(s,p.a)){o=u.awy(a9.gH7())
a6.dy=B.mU(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.Dk()
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
for(;k>=s;--k){i=u.a0f(k)
h=i.c
g=a6.azw(a8.GX(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b_$
h.toString
h.l0(p.aEG(a8))
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
h=B.Z(a6).l("bw.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a0f(k)
e=i.c
a0=a8.GX(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bl$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.azu(a0,j)
if(g==null){d=!0
break}}else g.l0(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.eE$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a9R(a8,s,t,n,m)
a4=a6.D5(a8,Math.min(x,n),m)
a5=a6.H5(a8,n,m)
a6.dy=B.mU(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.Dk()}}
A.Gh.prototype={
avX(d){return new A.arG(this.to,this.x1,null)}}
A.arG.prototype={
c_(d){var x=new A.aqk(this.f,y.v.a(d),B.X(y.e,y.g),0,null,null,B.br())
x.bZ()
return x},
c4(d,e){e.saFq(this.f)},
a9Q(d,e,f,g,h){var x
this.aKg(d,e,f,g,h)
x=this.f.Rn(d).awy(this.d.gHP())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bfO,A.bfP,A.arH])
w(A.a0T,A.bfP)
w(A.Pb,B.kA)
w(A.aqk,B.wf)
w(A.Gh,B.UJ)
w(A.arG,B.tU)})()
B.dl(b.typeUniverse,JSON.parse('{"Pb":{"kA":[],"zk":[],"jg":["av"],"ts":[],"h7":[]},"aqk":{"wf":[],"ez":[],"bw":["av","kA"],"ao":[],"bF":[],"bw.1":"kA","bw.0":"av"},"Gh":{"as":[],"K":[]},"arG":{"tU":[],"bv":[],"K":[]}}'))
var y={x:B.ai("S<L>"),g:B.ai("av"),z:B.ai("q7"),t:B.ai("Pb"),v:B.ai("CI"),c:B.ai("kA"),e:B.ai("V")}};
(a=>{a["dmRbx7I9zo92/0f63l93kGzYY7w="]=a.current})($__dart_deferred_initializers__);