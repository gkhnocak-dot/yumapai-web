((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var J,A,C,B={yX:function yX(d,e,f,g,h,i,j,k,l,m,n,o){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i
_.r=j
_.w=k
_.x=l
_.y=m
_.z=n
_.Q=o},lt:function lt(d,e){this.a=d
this.b=e},t9:function t9(d,e,f){this.a=d
this.b=e
this.c=f},o3:function o3(d,e,f,g,h){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h},
jV(d,e,f,g,h){A.a7H("business",new B.dh2())
return B.jv(d,e,f,g,h)},
e1_(d){return $.dC0.cP(0,d,new B.d2y())},
a6O(d,e,f,g){var x=0,w=A.D(y.P),v,u,t,s
var $async$a6O=A.z(function(h,i){if(h===1)return A.A(i,w)
for(;;)switch(x){case 0:s=d.gcw().c
s=s==null?null:s.a
u=(s==null?"":s)+"|"+g
s=A.fg(f,y.N,y.z)
s.v(0,"p_idempotency_key",B.e1_(u))
x=3
return A.w(B.BY(d,e,s),$async$a6O)
case 3:t=i
$.dC0.Y(0,u)
v=t
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$a6O,w)},
jv(d,e,f,g,h){return B.e10(d,e,f,g,h)},
e10(b1,b2,b3,b4,b5){var x=0,w=A.D(y.N),v,u=2,t=[],s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,b0
var $async$jv=A.z(function(b6,b7){if(b6===1){t.push(b7)
x=u}for(;;)A:switch(x){case 0:a9=$.cn().b
a9===$&&A.t()
s=a9
u=4
case 7:switch(b1){case"mine":x=9
break
case"search":x=10
break
case"select":x=11
break
case"submit":x=12
break
case"nfForm":x=13
break
case"nfSubmit":x=14
break
case"upload":x=15
break
case"website":x=16
break
case"websiteCheck":x=17
break
case"withdraw":x=18
break
case"panel":x=19
break
case"propose":x=20
break
case"address":x=21
break
case"hoursA":x=22
break
case"hoursB":x=23
break
case"report":x=24
break
default:x=8
break}break
case 9:x=25
return A.w(B.rM(s),$async$jv)
case 25:a9=b7
v=a9
x=1
break
case 10:x=26
return A.w(B.d2W(s,b2),$async$jv)
case 26:a9=b7
v=a9
x=1
break
case 11:x=27
return A.w(B.BY(s,"get_business_eligibility",A.f(["p_place_id",b2],y.N,y.z)),$async$jv)
case 27:r=b7
if(!J.G(J.H(r,"ok"),!0)){a9=B.oT(J.H(r,"code"))
v=a9
x=1
break}if(!J.G(J.H(r,"claimable"),!0)){a9=B.oT(J.H(r,"reason"))
v=a9
x=1
break}a9=$.m().My
a2=A.a6(a9).l("an<1>")
a3=A.a_(new A.an(a9,new B.d2H(b2),a2),a2.l("T.E"))
q=a3
a9=$.m()
new B.d2I(b2,q,r).$0()
a9.E()
v="OK"
x=1
break
case 12:p=$.m().Gn
if(J.aQ(p)===0){v="biz.err.invalid"
x=1
break}a9=b2==="MANAGER"?"MANAGER":"OWNER"
a2=C.u.aJ(b3)
a4=C.u.aJ(b4)
if(a4.length===0)a4=null
a5=C.u.aJ(b5)
if(a5.length===0)a5=null
x=28
return A.w(B.a6O(s,"business_claim_submit",A.f(["p_place_id",p,"p_role",a9,"p_business_name",a2,"p_contact_phone",a4,"p_note",a5],y.N,y.z),"submit|"+A.M(p)+"|"+b2+"|"+a2),$async$jv)
case 28:o=b7
if(!J.G(J.H(o,"ok"),!0)){a9=B.oT(J.H(o,"code"))
v=a9
x=1
break}if(J.G(J.H(o,"replayed"),!0)&&!D.Vg.D(0,A.M(J.H(o,"status")))){v="biz.err.closed"
x=1
break}a9=$.m()
new B.d2J().$0()
a9.E()
x=29
return A.w(B.rM(s),$async$jv)
case 29:a9=b7
v=a9
x=1
break
case 13:$.If.a7(0)
a9=y.N
$.If.a4(0,A.f(["name",C.u.aJ(b2),"city",C.u.aJ(b3),"district",C.u.aJ(b4),"address",C.u.aJ(b5)],a9,a9))
v="OK"
x=1
break
case 14:a9=$.If.i(0,"name")
if(a9==null)a9=""
a2=$.If.i(0,"city")
if(a2==null)a2=""
a4=$.If.i(0,"district")
if(a4==null)a4=""
a5=$.If.i(0,"address")
if(a5==null)a5=""
a6=b3==="MANAGER"?"MANAGER":"OWNER"
a7=C.u.aJ(b4)
x=30
return A.w(B.a6O(s,"business_claim_submit_not_found",A.f(["p_name",a9,"p_category",b2,"p_city",a2,"p_district",a4,"p_address",a5,"p_role",a6,"p_business_name",a7],y.N,y.z),"nf|"+new A.c7($.If,A.X($.If).l("c7<2>")).b2(0,"|")+"|"+b2+"|"+b3+"|"+a7),$async$jv)
case 30:n=b7
if(!J.G(J.H(n,"ok"),!0)){a9=B.oT(J.H(n,"code"))
v=a9
x=1
break}if(J.G(J.H(n,"replayed"),!0)&&!D.Vg.D(0,A.M(J.H(n,"status")))){v="biz.err.closed"
x=1
break}a9=$.m()
new B.d2K().$0()
a9.E()
x=31
return A.w(B.rM(s),$async$jv)
case 31:a9=b7
v=a9
x=1
break
case 15:x=32
return A.w(B.aDX(s,b2,b3),$async$jv)
case 32:a9=b7
v=a9
x=1
break
case 16:a9=C.u.aJ(b3)
x=33
return A.w(B.BY(s,"business_website_token",A.f(["p_claim_id",b2,"p_domain",a9.length===0?null:a9],y.N,y.z)),$async$jv)
case 33:m=b7
if(!J.G(J.H(m,"ok"),!0)){a9=B.oT(J.H(m,"code"))
v=a9
x=1
break}x=34
return A.w(B.rM(s),$async$jv)
case 34:a9=b7
v=a9
x=1
break
case 17:a9=s.Q
a9===$&&A.t()
a2=y.N
x=35
return A.w(a9.m0("business",A.f(["action","verifyWebsite","evidenceId",b2],a2,a2)),$async$jv)
case 35:l=b7
a9=y.f
a4=y.z
k=a9.b(l.a)?A.bh(a9.a(l.a),a2,a4):A.U(a2,a4)
if(!J.G(J.H(k,"ok"),!0)){a9=B.oT(J.H(k,"code"))
v=a9
x=1
break}a9=$.m()
new B.d2L().$0()
a9.E()
x=36
return A.w(B.rM(s),$async$jv)
case 36:a9=b7
v=a9
x=1
break
case 18:x=37
return A.w(B.BY(s,"business_claim_withdraw",A.f(["p_claim_id",b2],y.N,y.z)),$async$jv)
case 37:j=b7
if(!J.G(J.H(j,"ok"),!0)){a9=B.oT(J.H(j,"code"))
v=a9
x=1
break}x=38
return A.w(B.rM(s),$async$jv)
case 38:a9=b7
v=a9
x=1
break
case 19:x=39
return A.w(B.a6N(s),$async$jv)
case 39:a9=b7
v=a9
x=1
break
case 20:a9=b2==="contact.phone"||b2==="contact.website"||C.u.bO(b2,"description")||b2==="name.primary"?C.u.aJ(b3):b3
x=40
return A.w(B.Pt(s,b2,a9),$async$jv)
case 40:a9=b7
v=a9
x=1
break
case 21:a9=y.N
x=41
return A.w(B.Pt(s,"address",A.f(["line",C.u.aJ(b2),"district",C.u.aJ(b3),"city",C.u.aJ(b4)],a9,a9)),$async$jv)
case 41:a9=b7
v=a9
x=1
break
case 22:$.aDW.a7(0)
a9=y.N
$.aDW.a4(0,A.f(["1",b2,"2",b3,"3",b4,"4",b5],a9,a9))
v="OK"
x=1
break
case 23:a9=y.N
$.aDW.a4(0,A.f(["5",b2,"6",b3,"7",b4],a9,a9))
i=A.U(a9,a9)
for(a9=new A.dC($.aDW,A.X($.aDW).l("dC<1,2>")).gam(0);a9.H();){a2=a9.d
a2.toString
h=a2
g=C.u.aJ(h.b).toLowerCase()
if(J.aQ(g)===0||J.G(g,"kapal\u0131")||J.G(g,"kapali")||J.G(g,"closed")){J.b4(i,h.a,"closed")
continue}f=A.c2("^(\\d{1,2})[:.](\\d{2})\\s*[-\u2013]\\s*(\\d{1,2})[:.](\\d{2})$",!0,!1).qK(g)
if(f==null){v="biz.err.invalid"
x=1
break A}e=new B.d2N()
a2=h.a
a4=f.b[1]
a4.toString
a4=A.M(e.$1(a4))
a5=f.b[2]
a6=f.b[3]
a6.toString
J.b4(i,a2,a4+":"+A.M(a5)+"-"+A.M(e.$1(a6))+":"+A.M(f.b[4]))}x=42
return A.w(B.Pt(s,"hours",i),$async$jv)
case 42:a9=b7
v=a9
x=1
break
case 24:x=43
return A.w(B.BY(s,"business_report_review",A.f(["p_review_id",b2,"p_reason",b3.length===0?"OTHER":b3],y.N,y.z)),$async$jv)
case 43:d=b7
if(!J.G(J.H(d,"ok"),!0)){a9=B.oT(J.H(d,"code"))
v=a9
x=1
break}a9=$.m()
new B.d2M(b2).$0()
a9.E()
v="OK"
x=1
break
case 8:v="social.err.generic"
x=1
break
u=2
x=6
break
case 4:u=3
b0=t.pop()
a0=A.au(b0)
a1=A.b8(b0)
if(!B.dC_(a0))A.nY("BRIDGE_FAILURE","business."+b1,a0,a1)
a9=B.dC_(a0)?"auth.err.network":"social.err.generic"
v=a9
x=1
break
x=6
break
case 3:x=2
break
case 6:case 1:return A.B(v,w)
case 2:return A.A(t.at(-1),w)}})
return A.C($async$jv,w)},
dC_(d){var x=J.dm(d)
return C.u.D(x,"SocketException")||C.u.D(x,"ClientException")||C.u.D(x,"TimeoutException")||C.u.D(x,"Failed host lookup")||C.u.D(x,"Connection closed")||C.u.D(x,"HandshakeException")},
BY(d,e,f){return A.vF(e,f,new B.d2V(d,e,f))},
d2U(d,e,f){return B.e11(d,e,f)},
e11(d,e,f){var x=0,w=A.D(y.P),v,u=2,t=[],s,r,q,p,o,n
var $async$d2U=A.z(function(g,h){if(g===1){t.push(h)
x=u}for(;;)switch(x){case 0:u=4
p=y.z
x=7
return A.w(d.f9(e,f,p).dv(0,C.cv),$async$d2U)
case 7:s=h
p=A.bh(y.f.a(s),y.N,p)
v=p
x=1
break
u=2
x=6
break
case 4:u=3
n=t.pop()
p=A.au(n)
if(p instanceof A.hU){r=p
if(r.b==="NOT_AUTHENTICATED"){A.i2(A.hI(!0),y.H)
v=A.f(["ok",!1,"code","NOT_AUTHENTICATED"],y.N,y.z)
x=1
break}q=A.yE(r)
if(q!=null){v=q
x=1
break}throw n}else throw n
x=6
break
case 3:x=2
break
case 6:case 1:return A.B(v,w)
case 2:return A.A(t.at(-1),w)}})
return A.C($async$d2U,w)},
oT(d){var x=A.IE(d)
if(x!=null)return x
switch(A.M(d)){case"PLACE_NOT_CLAIMABLE":case"CATEGORY_NOT_CLAIMABLE":case"MARKET_NOT_ACTIVE":case"OWNERSHIP_DISABLED":case"PLACE_NOT_FOUND":case"CLAIM_NOT_ALLOWED":return"biz.err.notEligible"
case"DUPLICATE_CLAIM":case"DUPLICATE_DOCUMENT":return"biz.err.duplicate"
case"TOO_MANY_OPEN_CLAIMS":case"EVIDENCE_LIMIT":return"biz.err.tooMany"
case"ALREADY_AUTHORIZED":return"biz.err.alreadyYours"
case"FILE_TYPE_INVALID":case"FILE_SIZE_INVALID":return"biz.err.photo"
case"UPLOAD_MISSING":case"STORAGE_ERROR":return"biz.err.upload"
case"DOMAIN_INVALID":case"METHOD_DISABLED":return"biz.err.website"
case"TOKEN_NOT_FOUND":return"biz.err.tokenMissing"
case"OWNER_CONSENT_REQUIRED":return"biz.err.ownerConsent"
case"IDEMPOTENCY_CONFLICT":return"biz.err.retry"
case"CONTENT_LICENCE_REQUIRED":return"biz.err.contentLicence"
case"NOT_AUTHORIZED":case"OWNERSHIP_SUSPENDED":return"biz.err.notAuthorized"
case"CLAIM_CLOSED":case"EVIDENCE_CLOSED":return"biz.err.closed"
case"RATE_LIMITED":return"auth.err.rateLimited"
case"NOT_AUTHENTICATED":case"ACCOUNT_INACTIVE":return"auth.err.session"
case"INVALID_ARGUMENT":case"BUSINESS_NAME_INVALID":case"PHONE_INVALID":case"WEBSITE_INVALID":case"HOURS_INVALID":case"DESCRIPTION_INVALID":case"VALUE_INVALID":return"biz.err.invalid"}return"social.err.generic"},
rM(a6){var x=0,w=A.D(y.N),v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5
var $async$rM=A.z(function(a7,a8){if(a7===1)return A.A(a8,w)
for(;;)switch(x){case 0:a2=y.N
a3=y.z
x=3
return A.w(B.BY(a6,"my_business_claims",A.U(a2,a3)),$async$rM)
case 3:a4=a8
a5=J.aj(a4)
if(!J.G(a5.i(a4,"ok"),!0)){v=B.oT(a5.i(a4,"code"))
x=1
break}u=A.e([],y.u)
t=y.g
s=t.a(a5.i(a4,"claims"))
s=J.bc(s==null?C.V:s)
r=y.P
q=y.f
while(s.H()){p=A.bh(q.a(s.ga2(s)),a2,a3)
o=A.M(p.i(0,"status"))
n=o==="CLAIM_REQUESTED"
m=n||o==="VERIFICATION_PENDING"||o==="MORE_EVIDENCE_REQUIRED"
l=t.a(p.i(0,"evidence"))
if(l==null)l=C.V
l=J.cw(l,new B.d2z(),r)
k=A.a_(l,l.$ti.l("az.E"))
l=A.a6(k)
j=l.l("an<1>")
i=A.a_(new A.an(k,new B.d2A(),j),j.l("T.E"))
if(o==="MORE_EVIDENCE_REQUIRED"){h=p.i(0,"moreEvidenceNote")
h=A.M(h==null?"":h).length!==0}else h=!1
g=h?A.M(p.i(0,"moreEvidenceNote")):""
if(o==="REJECTED"){h=p.i(0,"decisionNote")
h=A.M(h==null?"":h).length!==0}else h=!1
if(h)g=A.M(p.i(0,"decisionNote"))
if(n&&J.G(p.i(0,"kind"),"PLACE_NOT_FOUND")&&p.i(0,"placeId")==null)g=$.m().x!=="en"?"Ekibimiz mek\xe2n\u0131 ar\u0131yor.":"Our team is looking for the place."
n=A.M(p.i(0,"claimId"))
h=p.i(0,"placeName")
h=A.M(h==null?"":h)
f=($.m().x!=="en"?D.aMf:D.aMg).i(0,o)
if(f==null)f=o
if(J.G(p.i(0,"role"),"MANAGER"))e=$.m().x!=="en"?"Y\xf6netici ba\u015fvurusu":"Manager application"
else e=$.m().x!=="en"?"Sahip ba\u015fvurusu":"Owner application"
l=new A.e6(new A.an(k,new B.d2B(),j),new B.d2C(),l.l("e6<1,O>")).b2(0," \xb7 ")
j=i.length===0?"":A.M(J.H(C.q.gaC(i),"token"))
d=i.length===0?"":"https://"+A.M(J.H(C.q.gaC(i),"domain"))+"/.well-known/yumapai-verification.txt"
u.push(new B.yX(n,h,o,f,e,g,l,m,m,j,d,i.length===0?"":A.M(J.H(C.q.gaC(i),"evidenceId"))))}a2=t.a(a5.i(a4,"authorizations"))
if(a2==null)a2=C.V
r=J.cw(a2,new B.d2D(),r)
a0=A.a_(r,r.$ti.l("az.E"))
a2=A.a6(a0).l("an<1>")
a1=A.a_(new A.an(a0,new B.d2E(),a2),a2.l("T.E"))
a2=$.m()
new B.d2F(u,a0,a1).$0()
a2.E()
v="OK"
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$rM,w)},
d2W(d,e){var x=0,w=A.D(y.N),v,u,t,s,r,q,p,o,n,m,l,k,j,i
var $async$d2W=A.z(function(f,g){if(f===1)return A.A(g,w)
for(;;)switch(x){case 0:i=C.u.aJ(e)
if(i.length<2){v="biz.err.invalid"
x=1
break}u=$.m().x!=="en"?"tr":"en"
t=y.N
s=y.z
x=3
return A.w(B.BY(d,"search_places",A.f(["p_query",i,"p_category",null,"p_lat",null,"p_lon",null,"p_limit",10,"p_offset",0,"p_locale",u,"p_surface","BUSINESS_CLAIM"],t,s)),$async$d2W)
case 3:r=g
i=J.aj(r)
if(!J.G(i.i(r,"ok"),!0)){v=B.oT(i.i(r,"code"))
x=1
break}q=A.e([],y.U)
i=y.g.a(i.i(r,"results"))
i=J.bc(i==null?C.V:i)
u=y.s
p=y.f
while(i.H()){o=A.bh(p.a(i.ga2(i)),t,s)
if(p.b(o.i(0,"area"))){n=J.H(p.a(o.i(0,"area")),"label")
if(n==null)n=J.H(p.a(o.i(0,"area")),"name")
m=A.M(n==null?"":n)}else{n=o.i(0,"area")
m=A.M(n==null?"":n)}n=A.M(o.i(0,"placeId"))
l=o.i(0,"name")
l=A.M(l==null?"":l)
k=A.e([],u)
j=o.i(0,"category")
if(A.M(j==null?"":j).length!==0)k.push(A.M(o.i(0,"category")))
if(m.length!==0)k.push(m)
q.push(new B.t9(n,l,C.q.b2(k," \xb7 ")))}i=$.m()
new B.d2X(q).$0()
i.E()
v="OK"
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$d2W,w)},
aDX(d,e,f){var x=0,w=A.D(y.N),v,u,t,s,r,q
var $async$aDX=A.z(function(g,h){if(g===1)return A.A(h,w)
for(;;)switch(x){case 0:x=3
return A.w(new A.wC().Nh(85,2400,2400,C.lS),$async$aDX)
case 3:q=h
if(q==null){v="CANCELLED"
x=1
break}x=4
return A.w(q.l_(),$async$aDX)
case 4:u=h
t=u.length
if(t===0||t>5242880){v="biz.err.photo"
x=1
break}s=q.b.toLowerCase()
r=q.a
if(r==null)if(C.u.eQ(s,".png"))r="image/png"
else{t=C.u.eQ(s,".jpg")||C.u.eQ(s,".jpeg")?"image/jpeg":null
r=t}if(r!=="image/jpeg"&&r!=="image/png"){v="biz.err.photo"
x=1
break}r.toString
v=B.Pu(d,e,f,u,r)
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$aDX,w)},
Pu(d,e,f,g,h){return B.e12(d,e,f,g,h)},
e12(d,e,f,g,h){var x=0,w=A.D(y.N),v,u=2,t=[],s,r,q,p,o,n,m,l
var $async$Pu=A.z(function(i,j){if(i===1){t.push(j)
x=u}for(;;)switch(x){case 0:p=f.length===0?"TAX_PLATE":f
o=y.N
n=y.z
x=3
return A.w(B.BY(d,"business_evidence_create_upload",A.f(["p_claim_id",e,"p_doc_type",p,"p_mime",h],o,n)),$async$Pu)
case 3:m=j
if(!J.G(J.H(m,"ok"),!0)){v=B.oT(J.H(m,"code"))
x=1
break}u=5
p=d.as
p===$&&A.t()
p=p.ko("business-evidence")
s=A.M(J.H(m,"path"))
x=8
return A.w(p.pE(s,g,new A.qG(!1,h)),$async$Pu)
case 8:u=2
x=7
break
case 5:u=4
l=t.pop()
if(A.au(l) instanceof A.uK){v="biz.err.upload"
x=1
break}else throw l
x=7
break
case 4:x=2
break
case 7:p=d.Q
p===$&&A.t()
x=9
return A.w(p.m0("business",A.f(["action","finalizeEvidence","evidenceId",J.H(m,"evidenceId")],o,n)),$async$Pu)
case 9:p=j.a
q=y.f.b(p)?A.bh(p,o,n):A.U(o,n)
if(!J.G(q.i(0,"ok"),!0)){v=B.oT(q.i(0,"code"))
x=1
break}p=$.m()
new B.d2Y().$0()
p.E()
x=10
return A.w(B.rM(d),$async$Pu)
case 10:v=j
x=1
break
case 1:return A.B(v,w)
case 2:return A.A(t.at(-1),w)}})
return A.C($async$Pu,w)},
a6N(a1){var x=0,w=A.D(y.N),v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0
var $async$a6N=A.z(function(a2,a3){if(a2===1)return A.A(a3,w)
for(;;)switch(x){case 0:x=$.m().Ci.length===0?3:4
break
case 3:x=5
return A.w(B.rM(a1),$async$a6N)
case 5:u=a3
if(u!=="OK"){v=u
x=1
break}case 4:t=$.m()
s=t.Ci
if(s.length===0){new B.d2O().$0()
t.E()
v="OK"
x=1
break}t=y.N
r=y.z
x=6
return A.w(B.BY(a1,"business_dashboard",A.f(["p_place_id",s],t,r)),$async$a6N)
case 6:q=a3
s=J.aj(q)
if(!J.G(s.i(q,"ok"),!0)){p=A.M(s.i(q,"code"))
t=$.m()
new B.d2P(p).$0()
t.E()
v=p==="NOT_AUTHORIZED"||p==="OWNERSHIP_SUSPENDED"?"OK":B.oT(p)
x=1
break}o=y.Y
n=o.a(s.i(q,"kpis"))
m=A.bh(n==null?A.U(r,r):n,t,r)
n=o.a(s.i(q,"ownership"))
l=A.bh(n==null?A.U(r,r):n,t,r)
n=o.a(s.i(q,"place"))
k=A.bh(n==null?A.U(r,r):n,t,r)
s=o.a(s.i(q,"current"))
j=A.bh(s==null?A.U(r,r):s,t,r)
s=o.a(j.i(0,"hours"))
i=A.bh(s==null?A.U(r,r):s,t,r)
if(i.a===0)h=$.m().x!=="en"?"Saat bilgisi yok.":"No hours yet."
else{s=A.e([],y.s)
for(g=1;g<=7;++g){r=($.m().x!=="en"?C.G6:C.F9)[g]
o=i.i(0,""+g)
if(o==null)o=$.m().x!=="en"?"kapal\u0131":"closed"
s.push(r+" "+A.M(o))}h=C.q.b2(s," \xb7 ")}s=$.m().x!=="en"
r=s?"\xc7al\u0131\u015fma saatlerini ekle":"Add opening hours"
o=s?"Telefon numaras\u0131 ekle":"Add a phone number"
n=s?"Web sitesi ekle":"Add a website"
f=s?"K\u0131sa bir a\xe7\u0131klama ekle":"Add a short description"
e=s?"\u0130ncelemedeki de\u011fi\u015fiklik talepleri var":"Change requests are in review"
d=s?"Mek\xe2n \u015fu an aktif g\xf6r\xfcnm\xfcyor":"The place is not active right now"
a0=A.f(["ADD_HOURS",r,"ADD_PHONE",o,"ADD_WEBSITE",n,"ADD_DESCRIPTION",f,"PROPOSALS_IN_REVIEW",e,"PLACE_NOT_ACTIVE",d,"PLACE_NOT_PUBLIC",s?"Mek\xe2n \u015fu an YuMapAI'de herkese a\xe7\u0131k g\xf6r\xfcnm\xfcyor; de\u011fi\u015fikliklerin yeniden yay\u0131na girince g\xf6r\xfcn\xfcr":"The place is not public on YuMapAI right now; your changes show once it is listed again"],t,t)
t=$.m()
new B.d2Q(k,l,new B.d2R(),new B.d2S(),m,q,a0,j,h).$0()
t.E()
v="OK"
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$a6N,w)},
Pt(d,e,f){var x=0,w=A.D(y.N),v,u,t,s,r
var $async$Pt=A.z(function(g,h){if(g===1)return A.A(h,w)
for(;;)switch(x){case 0:if(typeof f=="string"&&f.length===0){v="biz.err.invalid"
x=1
break}u=$.m().Ci
if(u.length===0){v="biz.err.notAuthorized"
x=1
break}x=3
return A.w(B.a6O(d,"business_propose",A.f(["p_place_id",u,"p_field",e,"p_value",f],y.N,y.z),"prop|"+u+"|"+e+"|"+A.M(f)),$async$Pt)
case 3:t=h
s=J.aj(t)
if(!J.G(s.i(t,"ok"),!0)){v=B.oT(s.i(t,"code"))
x=1
break}r=J.G(s.i(t,"status"),"APPLIED")
s=$.m()
new B.d2T(r,t).$0()
s.E()
x=4
return A.w(B.a6N(d),$async$Pt)
case 4:v=h
x=1
break
case 1:return A.B(v,w)}})
return A.C($async$Pt,w)},
dh2:function dh2(){},
d2y:function d2y(){},
d2H:function d2H(d){this.a=d},
d2I:function d2I(d,e,f){this.a=d
this.b=e
this.c=f},
d2J:function d2J(){},
d2K:function d2K(){},
d2L:function d2L(){},
d2N:function d2N(){},
d2M:function d2M(d){this.a=d},
d2G:function d2G(d){this.a=d},
d2V:function d2V(d,e,f){this.a=d
this.b=e
this.c=f},
d2z:function d2z(){},
d2A:function d2A(){},
d2B:function d2B(){},
d2C:function d2C(){},
d2D:function d2D(){},
d2E:function d2E(){},
d2F:function d2F(d,e,f){this.a=d
this.b=e
this.c=f},
d2X:function d2X(d){this.a=d},
d2Y:function d2Y(){},
d2O:function d2O(){},
d2P:function d2P(d){this.a=d},
d2S:function d2S(){},
d2R:function d2R(){},
d2Q:function d2Q(d,e,f,g,h,i,j,k,l){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i
_.r=j
_.w=k
_.x=l},
d2T:function d2T(d,e){this.a=d
this.b=e}},D
J=c[1]
A=c[0]
C=c[2]
B=a.updateHolder(c[61],B)
D=c[157]
B.yX.prototype={
fa(){var x=this
return A.aR(A.f(["claimId",A.a1(x.a,C.A,!1),"placeName",A.a1(x.b,C.A,!1),"status",A.a1(x.c,C.A,!1),"statusLabel",A.a1(x.d,C.A,!1),"roleLabel",A.a1(x.e,C.A,!1),"note",A.a1(x.f,C.A,!1),"evidenceText",A.a1(x.r,C.A,!1),"canEvidence",A.a1(x.w,C.ay,!1),"canWithdraw",A.a1(x.x,C.ay,!1),"tokenText",A.a1(x.y,C.A,!1),"tokenUrl",A.a1(x.z,C.A,!1),"tokenEvidenceId",A.a1(x.Q,C.A,!1)],y.N,y.T))},
q(d){var x=this
return"BizClaimStruct("+A.jd(A.f(["claimId",x.a,"placeName",x.b,"status",x.c,"statusLabel",x.d,"roleLabel",x.e,"note",x.f,"evidenceText",x.r,"canEvidence",x.w,"canWithdraw",x.x,"tokenText",x.y,"tokenUrl",x.z,"tokenEvidenceId",x.Q],y.N,y.X),y.K).q(0)+")"},
t(d,e){var x,w,v=this
if(e==null)return!1
x=!1
if(e instanceof B.yX){w=e.a
if(v.a===w){w=e.b
if(v.b===w){w=e.c
if(v.c===w){w=e.d
if(v.d===w){w=e.e
if(v.e===w){w=e.f
if(v.f===w){w=e.r
if(v.r===w){w=e.w
if(v.w===w){w=e.x
if(v.x===w){w=e.y
if(v.y===w){w=e.z
if(v.z===w){x=e.Q
x=v.Q===x}}}}}}}}}}}}return x},
gJ(d){var x=this
return C.b8.e6(0,[x.a,x.b,x.c,x.d,x.e,x.f,x.r,x.w,x.x,x.y,x.z,x.Q])}}
B.lt.prototype={
fa(){return A.aR(A.f(["label",A.a1(this.a,C.A,!1),"value",A.a1(this.b,C.A,!1)],y.N,y.T))},
q(d){return"BizKvStruct("+A.aR(A.f(["label",this.a,"value",this.b],y.N,y.T)).q(0)+")"},
t(d,e){var x,w
if(e==null)return!1
x=!1
if(e instanceof B.lt){w=e.a
if(this.a===w){x=e.b
x=this.b===x}}return x},
gJ(d){return C.b8.e6(0,[this.a,this.b])}}
B.t9.prototype={
fa(){return A.aR(A.f(["placeId",A.a1(this.a,C.A,!1),"name",A.a1(this.b,C.A,!1),"sub",A.a1(this.c,C.A,!1)],y.N,y.T))},
q(d){return"BizPlaceStruct("+A.aR(A.f(["placeId",this.a,"name",this.b,"sub",this.c],y.N,y.T)).q(0)+")"},
t(d,e){var x,w
if(e==null)return!1
x=!1
if(e instanceof B.t9){w=e.a
if(this.a===w){w=e.b
if(this.b===w){x=e.c
x=this.c===x}}}return x},
gJ(d){return C.b8.e6(0,[this.a,this.b,this.c])}}
B.o3.prototype={
fa(){var x=this
return A.aR(A.f(["reviewId",A.a1(x.a,C.A,!1),"ratingText",A.a1(x.b,C.A,!1),"text",A.a1(x.c,C.A,!1),"dateText",A.a1(x.d,C.A,!1),"reported",A.a1(x.e,C.ay,!1)],y.N,y.T))},
q(d){var x=this
return"BizReviewStruct("+A.jd(A.f(["reviewId",x.a,"ratingText",x.b,"text",x.c,"dateText",x.d,"reported",x.e],y.N,y.X),y.K).q(0)+")"},
t(d,e){var x,w,v=this
if(e==null)return!1
x=!1
if(e instanceof B.o3){w=e.a
if(v.a===w){w=e.b
if(v.b===w){w=e.c
if(v.c===w){w=e.d
if(v.d===w){x=v.e
w=e.e
x=x===w}}}}}return x},
gJ(d){var x=this,w=x.e
return C.b8.e6(0,[x.a,x.b,x.c,x.d,w])}}
var z=a.updateTypes([])
B.dh2.prototype={
$0(){var x=0,w=A.D(y.H),v
var $async$$0=A.z(function(d,e){if(d===1)return A.A(e,w)
for(;;)switch(x){case 0:x=$.m().Mx.length!==0?2:3
break
case 2:v=$.cn().b
v===$&&A.t()
x=4
return A.w(B.rM(v),$async$$0)
case 4:case 3:return A.B(null,w)}})
return A.C($async$$0,w)},
$S:1}
B.d2y.prototype={
$0(){var x,w,v=J.i4(4,y.N)
for(x=0;x<4;++x){w=$.dIh()
v[x]=C.u.du(C.r.iC(w.kZ(65536)*65536+w.kZ(65536),16),8,"0")}return"yb-"+C.q.pr(v)},
$S:26}
B.d2H.prototype={
$1(d){return d.a===this.a},
$S:1211}
B.d2I.prototype={
$0(){var x,w,v=$.m()
v.Gn=this.a
x=this.b
if(x.length===0)w=""
else w=C.q.ga8(x).b
v.a69=w
w=$.m()
if(J.G(J.H(this.c,"hasVerifiedOwner"),!0))v=$.m().x!=="en"?"Bu mek\xe2n\u0131n do\u011frulanm\u0131\u015f bir i\u015fletmecisi var: ba\u015fvurun ayr\u0131ca incelenir (devir).":"This place already has a verified business: your application is reviewed as a transfer."
else if(x.length===0)v=""
else v=C.q.ga8(x).c
w.a6a=v},
$S:0}
B.d2J.prototype={
$0(){var x=$.m()
x.Gn=""
x.My=A.e([],y.U)
x=$.m()
x.hv=x.x!=="en"?"Ba\u015fvurun al\u0131nd\u0131. Do\u011frulama i\xe7in bir belge foto\u011fraf\u0131 ekle.":"Application received. Add a photo of a document for verification."},
$S:0}
B.d2K.prototype={
$0(){var x=$.m()
x.Ux=""
x.hv=x.x!=="en"?"Ba\u015fvurun al\u0131nd\u0131. Ekibimiz mek\xe2n\u0131 bulup ba\u015fvurunu ona ba\u011flayacak.":"Application received. Our team will find the place and link your application."},
$S:0}
B.d2L.prototype={
$0(){var x=$.m()
return x.hv=x.x!=="en"?"Web sitesi do\u011frulamas\u0131 kaydedildi; ekibimiz ba\u015fvurunu inceleyecek.":"Website proof recorded; our team will review your application."},
$S:0}
B.d2N.prototype={
$1(d){return C.u.du(d,2,"0")},
$S:51}
B.d2M.prototype={
$0(){var x=$.m(),w=x.Mz,v=A.a6(w).l("ag<1,o3>")
w=A.a_(new A.ag(w,new B.d2G(this.a),v),v.l("az.E"))
x.Mz=w
x=$.m()
x.hv=x.x!=="en"?"Bildirimin moderasyon ekibine iletildi. Yorum de\u011fi\u015fmedi.":"Your report went to moderation. The review is unchanged."},
$S:0}
B.d2G.prototype={
$1(d){if(d.a===this.a)d.e=!0
return d},
$S:1212}
B.d2V.prototype={
$0(){return B.d2U(this.a,this.b,this.c)},
$S:90}
B.d2z.prototype={
$1(d){return A.bh(y.f.a(d),y.N,y.z)},
$S:71}
B.d2A.prototype={
$1(d){var x=J.aj(d)
return J.G(x.i(d,"kind"),"WEBSITE_TOKEN")&&J.G(x.i(d,"status"),"SUBMITTED")&&x.i(d,"token")!=null},
$S:67}
B.d2B.prototype={
$1(d){return!J.G(J.H(d,"status"),"FAILED")},
$S:67}
B.d2C.prototype={
$1(d){var x,w,v=J.aj(d),u=A.M(v.i(d,"kind"))
v=A.M(v.i(d,"status"))
if(u==="WEBSITE_TOKEN"){u=$.m()
x=u.x!=="en"?"Web sitesi":"Website"}else{u=$.m()
x=u.x!=="en"?"Belge":"Document"}w=(u.x!=="en"?D.aMq:D.aMp).i(0,v)
v=w==null?v:w
return x+": "+v},
$S:1213}
B.d2D.prototype={
$1(d){return A.bh(y.f.a(d),y.N,y.z)},
$S:71}
B.d2E.prototype={
$1(d){return J.G(J.H(d,"state"),"ACTIVE")},
$S:67}
B.d2F.prototype={
$0(){var x,w,v,u=$.m()
u.Mx=this.a
x=this.b
w=x.length!==0
u.a68=w
v=this.c
if(v.length!==0)x=A.M(J.H(C.q.ga8(v),"placeId"))
else x=w?A.M(J.H(C.q.ga8(x),"placeId")):""
u.Ci=x},
$S:0}
B.d2X.prototype={
$0(){var x,w=$.m(),v=this.a
w.My=v
x=w.Gn=""
if(v.length===0)v=w.x!=="en"?'Sonu\xe7 yok. "Mek\xe2n\u0131m\u0131 bulam\u0131yorum" ile ba\u015fvurabilirsin.':'No results. You can apply with "I can\'t find my place".'
else v=x
w.hv=v},
$S:0}
B.d2Y.prototype={
$0(){var x=$.m()
return x.hv=x.x!=="en"?"Belge al\u0131nd\u0131. Ekibimiz inceleyip sonucu burada g\xf6sterecek.":"Document received. Our team will review it and show the result here."},
$S:0}
B.d2O.prototype={
$0(){return $.m().Cj="NOT_AUTHORIZED"},
$S:0}
B.d2P.prototype={
$0(){var x="OWNERSHIP_SUSPENDED",w=$.m()
return w.Cj=this.a===x?x:"NOT_AUTHORIZED"},
$S:0}
B.d2S.prototype={
$1(d){return d==null?"0":A.M(d)},
$S:55}
B.d2R.prototype={
$1(d){var x=A.ly(A.M(d)),w=x==null?null:x.pD()
return w==null?"":C.u.du(C.r.q(A.fS(w)),2,"0")+"."+C.u.du(C.r.q(A.eQ(w)),2,"0")+"."+A.h6(w)},
$S:55}
B.d2Q.prototype={
$0(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1=this,a2="status",a3="saves",a4="avgRating",a5="reviews",a6="tags",a7="minCell",a8="proposals",a9=$.m()
a9.Cj="OK"
x=a1.a
w=x.i(0,"name")
a9.a6b=A.M(w==null?"":w)
a9=$.m()
w=a1.b
if(J.G(w.i(0,"role"),"MANAGER")){v=$.m()
u=v.x!=="en"?"Y\xf6netici":"Manager"
t=u
u=v
v=t}else{v=$.m()
u=v.x!=="en"?"Sahip":"Owner"
t=u
u=v
v=t}u=u.x!=="en"?"Do\u011frulama":"Verified"
s=a1.c
w=A.e([v,u+" "+A.M(s.$1(w.i(0,"since")))],y.s)
if(!J.G(x.i(0,a2),"ACTIVE"))w.push(A.M(x.i(0,a2)))
if(J.G(x.i(0,a2),"ACTIVE")&&J.G(x.i(0,"publicNow"),!1))w.push($.m().x!=="en"?"\u015eu an herkese a\xe7\u0131k de\u011fil":"Not public right now")
a9.a6c=C.q.b2(w," \xb7 ")
a9=$.m()
x=a9.x!=="en"?"Kaydedilme":"Saves"
w=a1.d
v=a1.e
u=w.$1(v.i(0,a3))
r=$.m().x!=="en"?"De\u011ferlendirme":"Reviews"
q=v.i(0,a4)==null?w.$1(v.i(0,a5)):A.M(w.$1(v.i(0,a5)))+" \xb7 "+A.M(v.i(0,a4))+"\u2605"
p=$.m().x!=="en"?"Payla\u015f\u0131mlarda etiket":"Tagged in posts"
o=w.$1(v.i(0,a6))
n=$.m().x!=="en"?"Gezilere eklenme":"Added to trips"
m=y.y
a9.a64=A.e([new B.lt(x,u),new B.lt(r,q),new B.lt(p,o),new B.lt(n,w.$1(v.i(0,"tripAdds")))],m)
n=$.m()
if(J.G(v.i(0,"hasData"),!0))a9=$.m().x!=="en"?"Toplam say\u0131lar; ki\u015fi bilgisi yok. "+A.M(v.i(0,a7))+' alt\u0131ndaki say\u0131lar "<'+A.M(v.i(0,a7))+'" g\xf6sterilir.':"Totals only; no personal data. Counts under "+A.M(v.i(0,a7))+' show as "<'+A.M(v.i(0,a7))+'".'
else a9=$.m().x!=="en"?"Hen\xfcz etkinlik yok. Veri geldik\xe7e burada g\xf6r\xfcnecek.":"No activity yet. It will appear here as it comes in."
n.a6d=a9
a9=$.m()
n=A.e([],m)
x=a1.f
v=J.aj(x)
u=y.g
r=u.a(v.i(x,"weekly"))
r=J.dsk(r==null?C.V:r)
q=r.$ti
r=new A.ce(r,r.gK(0),q.l("ce<az.E>"))
p=y.f
q=q.l("az.E")
while(r.H()){l=r.d
if(l==null)l=q.a(l)
o=$.m().x!=="en"?"Hafta":"Week of"
p.a(l)
k=J.aj(l)
j=A.M(s.$1(k.i(l,"weekStart")))
i=$.m().x!=="en"?"kay\u0131t":a3
h=A.M(w.$1(k.i(l,a3)))
g=$.m().x!=="en"?"de\u011ferlendirme":a5
f=A.M(w.$1(k.i(l,a5)))
e=$.m().x!=="en"?"etiket":a6
n.push(new B.lt(o+" "+j,i+" "+h+" \xb7 "+g+" "+f+" \xb7 "+e+" "+A.M(w.$1(k.i(l,a6)))))}a9.a65=n
a9=$.m()
w=A.e([],m)
r=u.a(v.i(x,"actions"))
r=J.bc(r==null?C.V:r)
q=a1.r
while(r.H()){d=r.ga2(r)
o=q.i(0,A.M(d))
w.push(new B.lt(o==null?A.M(d):o,""))}r=u.a(v.i(x,"actions"))
if(J.d7(r==null?C.V:r))w.push(new B.lt($.m().x!=="en"?"\u015eu an yap\u0131lacak bir \u015fey yok.":"Nothing to do right now.",""))
a9.a66=w
a9=$.m()
m=A.e([],m)
w=u.a(v.i(x,a8))
w=J.bc(w==null?C.V:w)
while(w.H()){a0=w.ga2(w)
r=$.m().x!=="en"?D.aOf:D.aOg
p.a(a0)
q=J.aj(a0)
r=r.i(0,A.M(q.i(a0,"field")))
r=A.M(r==null?q.i(a0,"field"):r)
o=A.M(s.$1(q.i(a0,"at")))
n=$.m().x!=="en"?D.aOj:D.aOi
n=n.i(0,A.M(q.i(a0,a2)))
m.push(new B.lt(r+" \xb7 "+o,A.M(n==null?q.i(a0,a2):n)))}w=u.a(v.i(x,a8))
if(J.d7(w==null?C.V:w))m.push(new B.lt($.m().x!=="en"?"Hen\xfcz de\u011fi\u015fiklik yok.":"No changes yet.",""))
a9.a67=m
a9=$.m()
w=A.e([],y.R)
x=u.a(v.i(x,"recentReviews"))
x=J.bc(x==null?C.V:x)
while(x.H()){v=p.a(x.ga2(x))
u=J.aj(v)
r=A.M(u.i(v,"reviewId"))
q=A.M(u.i(v,"rating"))
o=u.i(v,"text")
w.push(new B.o3(r,q+"\u2605",A.M(o==null?"":o),s.$1(u.i(v,"at")),J.G(u.i(v,"reported"),!0)))}a9.Mz=w
$.m()
a9=a1.w
x=a9.i(0,"phone")
A.M(x==null?"":x)
$.m()
x=a9.i(0,"website")
A.M(x==null?"":x)
$.m().a6e=a1.x
x=a9.i(0,"descriptionTr")
A.M(x==null?"":x)
$.m()
a9=a9.i(0,"descriptionEn")
A.M(a9==null?"":a9)},
$S:0}
B.d2T.prototype={
$0(){var x,w=$.m()
if(this.a)if(J.G(J.H(this.b,"publicNow"),!1))x=$.m().x!=="en"?"Kaydedildi. Mek\xe2n \u015fu an YuMapAI'de herkese a\xe7\u0131k g\xf6r\xfcnm\xfcyor; bilgi mek\xe2n yeniden yay\u0131na girdi\u011finde g\xf6r\xfcn\xfcr.":"Saved. The place is not public on YuMapAI right now; the change shows once it is listed again."
else x=$.m().x!=="en"?'G\xfcncellendi. De\u011fi\u015fiklik mek\xe2n kayd\u0131nda "do\u011frulanm\u0131\u015f i\u015fletme" kayna\u011f\u0131yla yay\u0131nda.':"Updated. The change is live on the place record as verified-business data."
else if(J.G(J.H(this.b,"routeReason"),"SOURCE_BACKED_VALUE"))x=$.m().x!=="en"?"Bu bilgi do\u011frulanm\u0131\u015f bir kaynaktan geliyor; de\u011fi\u015fikli\u011fin incelemeye g\xf6nderildi.":"This value comes from a verified source; your change was sent for review."
else x=$.m().x!=="en"?"\u0130nceleme i\xe7in g\xf6nderildi. Onaylan\u0131nca mek\xe2n kayd\u0131na yans\u0131yacak.":"Sent for review. It will reach the place record once approved."
return w.hv=x},
$S:0};(function inheritance(){var x=a.inheritMany
x(A.dA,[B.yX,B.lt,B.t9,B.o3])
x(A.dh,[B.dh2,B.d2y,B.d2I,B.d2J,B.d2K,B.d2L,B.d2M,B.d2V,B.d2F,B.d2X,B.d2Y,B.d2O,B.d2P,B.d2Q,B.d2T])
x(A.d8,[B.d2H,B.d2N,B.d2G,B.d2z,B.d2A,B.d2B,B.d2C,B.d2D,B.d2E,B.d2S,B.d2R])})()
A.de(b.typeUniverse,JSON.parse('{"yX":{"dA":[]},"lt":{"dA":[]},"t9":{"dA":[]},"o3":{"dA":[]}}'))
var y=(function rtii(){var x=A.ai
return{w:x("aM<O,O>"),u:x("R<yX>"),y:x("R<lt>"),U:x("R<t9>"),R:x("R<o3>"),s:x("R<O>"),P:x("aB<O,@>"),f:x("aB<@,@>"),K:x("ah"),N:x("O"),z:x("@"),g:x("ac<@>?"),Y:x("aB<@,@>?"),X:x("ah?"),T:x("O?"),H:x("~")}})();(function constants(){D.QG={CLAIM_REQUESTED:0,VERIFICATION_PENDING:1,MORE_EVIDENCE_REQUIRED:2,APPROVED:3,REJECTED:4,WITHDRAWN:5,EXPIRED:6}
D.aMf=new A.aM(D.QG,["Belge bekleniyor","\u0130nceleniyor","Ek belge gerekli","Onayland\u0131","Reddedildi","Geri \xe7ekildi","S\xfcresi doldu"],y.w)
D.aMg=new A.aM(D.QG,["Waiting for a document","In review","More evidence needed","Approved","Rejected","Withdrawn","Expired"],y.w)
D.QH={PENDING_UPLOAD:0,SUBMITTED:1,ACCEPTED:2,REJECTED:3,FAILED:4,PURGED:5}
D.aMp=new A.aM(D.QH,["uploading","in review","accepted","not accepted","invalid","retention ended"],y.w)
D.aMq=new A.aM(D.QH,["y\xfckleniyor","incelemede","kabul edildi","kabul edilmedi","ge\xe7ersiz","saklama s\xfcresi doldu"],y.w)
D.QF={hours:0,"contact.phone":1,"contact.website":2,"description.tr":3,"description.en":4,"name.primary":5,category:6,address:7,location:8}
D.aOf=new A.aM(D.QF,["\xc7al\u0131\u015fma saatleri","Telefon","Web sitesi","A\xe7\u0131klama (TR)","A\xe7\u0131klama (EN)","Mek\xe2n ad\u0131","Kategori","Adres","Konum"],y.w)
D.aOg=new A.aM(D.QF,["Opening hours","Phone","Website","Description (TR)","Description (EN)","Place name","Category","Address","Location"],y.w)
D.QI={APPLIED:0,PENDING_REVIEW:1,APPROVED:2,REJECTED:3,WITHDRAWN:4,SUPERSEDED:5}
D.aOi=new A.aM(D.QI,["Live","In review","Approved","Rejected","Withdrawn","Replaced"],y.w)
D.aOj=new A.aM(D.QI,["Yay\u0131nda","\u0130ncelemede","Onayland\u0131","Reddedildi","Geri \xe7ekildi","Yenisiyle de\u011fi\u015fti"],y.w)
D.aPT={CLAIM_REQUESTED:0,VERIFICATION_PENDING:1,MORE_EVIDENCE_REQUIRED:2}
D.Vg=new A.dH(D.aPT,3,A.ai("dH<O>"))})();(function staticFields(){$.dC0=function(){var x=y.N
return A.U(x,x)}()
$.If=function(){var x=y.N
return A.U(x,x)}()
$.aDW=function(){var x=y.N
return A.U(x,x)}()})();(function lazyInitializers(){var x=a.lazyFinal
x($,"egw","dIh",()=>A.b0c())})()};
(a=>{a["1RawQ/3eLKc2lVe7/4utetEZJlE="]=a.current})($__dart_deferred_initializers__);