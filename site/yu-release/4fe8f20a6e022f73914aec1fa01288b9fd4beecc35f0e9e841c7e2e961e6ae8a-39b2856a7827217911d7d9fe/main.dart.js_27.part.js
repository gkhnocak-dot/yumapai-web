((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={beg:function beg(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},beh:function beh(){},a0g:function a0g(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aqP:function aqP(){},OP:function OP(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ng$=d
_.eW$=e
_.bb$=f
_.a=null},apr:function apr(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eD$=g
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
dy6(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kp:w}else x=j
return new A.G1(f,new B.w9(g,h,!0,!0,!0,0,B.SQ(),w),i,C.J,!1,d,w,x,w,k,w,0,w,w,h,C.kb,e,w,w,C.C,C.a6,w)},
G1:function G1(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
aqO:function aqO(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.beg.prototype={
aDI(d){var x=this.c
return d.GK(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.n.aR(B.e(["scrollOffset: "+B.G(x.a),"crossAxisOffset: "+B.G(x.b),"mainAxisExtent: "+B.G(x.c),"crossAxisExtent: "+B.G(x.d)],y.x),", ")+")"}}
A.beh.prototype={}
A.a0g.prototype={
aE1(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.r.f2(d/x)-1)
return 0},
aVS(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_G(d){var x=this,w=x.a,v=C.q.ah(d,w)
return new A.beg(C.q.hx(d,w)*x.b,x.aVS(v*x.c),x.d,x.e)},
avF(d){var x
if(d===0)return 0
x=this.b
return x*(C.q.hx(d-1,this.a)+1)-(x-this.d)}}
A.aqP.prototype={}
A.OP.prototype={
p(d){return"crossAxisOffset="+B.G(this.w)+"; "+this.aJf(0)}}
A.apr.prototype={
ju(d){if(!(d.b instanceof A.OP))d.b=new A.OP(!1,null,null)},
saEs(d){var x=this
if(x.ae===d)return
if(B.as(d)!==B.as(x.ae)||d.pg(x.ae))x.aM()
x.ae=d},
GY(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dI(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gau.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QW(a8)
t=u.b
s=t>1e-10?u.a*C.r.hx(w,t):0
r=isFinite(v)?u.aE1(v):a7
if(a6.b_$!=null){q=a6.avi(s)
a6.D1(q,r!=null?a6.avj(r):0)}else a6.D1(0,0)
p=u.a_G(s)
if(a6.b_$==null)if(!a6.a7c(s,p.a)){o=u.avF(a9.gGX())
a6.dy=B.mN(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.Db()
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
for(;k>=s;--k){i=u.a_G(k)
h=i.c
g=a6.ayz(a8.GK(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b_$
h.toString
h.kV(p.aDI(a8))
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
h=B.Z(a6).l("bt.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_G(k)
e=i.c
a0=a8.GK(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bb$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.ayx(a0,j)
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
a3=d?m:a9.a9e(a8,s,t,n,m)
a4=a6.CZ(a8,Math.min(x,n),m)
a5=a6.GU(a8,n,m)
a6.dy=B.mN(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.Db()}}
A.G1.prototype={
av2(d){return new A.aqO(this.to,this.x1,null)}}
A.aqO.prototype={
c_(d){var x=new A.apr(this.f,y.v.a(d),B.W(y.e,y.g),0,null,null,B.br())
x.bZ()
return x},
c6(d,e){e.saEs(this.f)},
a9d(d,e,f,g,h){var x
this.aJg(d,e,f,g,h)
x=this.f.QW(d).avF(this.d.gHB())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.beg,A.beh,A.aqP])
w(A.a0g,A.beh)
w(A.OP,B.kr)
w(A.apr,B.w0)
w(A.G1,B.U7)
w(A.aqO,B.tH)})()
B.ds(b.typeUniverse,JSON.parse('{"OP":{"kr":[],"z3":[],"j8":["au"],"te":[],"h4":[]},"apr":{"w0":[],"ev":[],"bt":["au","kr"],"ao":[],"bE":[],"bt.1":"kr","bt.0":"au"},"G1":{"av":[],"K":[]},"aqO":{"tH":[],"bv":[],"K":[]}}'))
var y={x:B.ai("R<L>"),g:B.ai("au"),z:B.ai("pY"),t:B.ai("OP"),v:B.ai("Cw"),c:B.ai("kr"),e:B.ai("U")}};
(a=>{a["MfOzisSX9jRk7Xe184glMxcOWk4="]=a.current})($__dart_deferred_initializers__);