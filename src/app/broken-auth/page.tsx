"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuthResult {
  success: boolean
  message: string
  sessionToken?: string
  user?: {
    id: number
    username: string
    email: string
  }
}

const BrokenAuthPage = () => {
  const [isVulnerable, setIsVulnerable] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<AuthResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const [stolenToken, setStolenToken] = useState("")
  const [hijackResult, setHijackResult] = useState<AuthResult | null>(null)
  const [hijackLoading, setHijackLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const endpoint = isVulnerable
        ? "/api/auth/vulnerable"
        : "/api/auth/secure"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      setResult(data)
      if (data.success && data.sessionToken) {
        setSessionToken(data.sessionToken)
      }
    } catch {
      setResult({ success: false, message: "Mrežna greška" })
    } finally {
      setLoading(false)
    }
  }

  const handleSessionHijack = async (e: React.FormEvent) => {
    e.preventDefault()
    setHijackLoading(true)
    setHijackResult(null)

    try {
      const endpoint = isVulnerable
        ? "/api/auth/vulnerable/verify"
        : "/api/auth/secure/verify"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: stolenToken }),
      })
      const data = await response.json()
      setHijackResult(data)
    } catch {
      setHijackResult({ success: false, message: "Mrežna greška" })
    } finally {
      setHijackLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Broken Authentication</h1>
          <Link href="/">
            <Button>Natrag na zadatke</Button>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isVulnerable ? <>Ranjiva verzija</> : <>Sigurna verzija</>}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="toggle">
                  {isVulnerable ? "Ranjivo" : "Sigurno"}
                </Label>
                <Switch
                  id="toggle"
                  checked={!isVulnerable}
                  onCheckedChange={(checked) => setIsVulnerable(!checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Korisničko ime</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Unesite korisničko ime"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Unesite lozinku"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Prijava..." : "Prijavi se"}
              </Button>
            </form>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? "Uspjeh" : "Greška"}</AlertTitle>
                <AlertDescription>
                  <p>{result.message}</p>
                  {result.user && (
                    <div className="rounded text-sm">
                      <p>Korisnik: {result.user.username}</p>
                    </div>
                  )}
                  {result.success && sessionToken && (
                    <div className="rounded text-sm">
                      <p className="text-sm mb-1">
                        Session Token: {sessionToken}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testiranje session hijackanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSessionHijack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Session Token</Label>
                <Input
                  id="token"
                  value={stolenToken}
                  onChange={(e) => setStolenToken(e.target.value)}
                  placeholder="Unesite session token"
                  required
                />
              </div>
              <Button type="submit" disabled={hijackLoading} className="w-full">
                {hijackLoading ? "Testiranje..." : "Testiraj Token"}
              </Button>
            </form>

            {hijackResult && (
              <Alert>
                <AlertTitle>
                  {hijackResult.success ? "Uspjeh" : "Session je zaštićen"}
                </AlertTitle>
                <AlertDescription>
                  <p>{hijackResult.message}</p>
                  {hijackResult.user && (
                    <div className="rounded text-sm">
                      <p>Korisnik: {hijackResult.user.username}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upute za testiranje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Normalna prijava</h3>
                <div className="p-3 bg-muted rounded text-sm space-y-1">
                  <p>Korisničko ime: admin</p>
                  <p>Lozinka: admin123</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Brute Force napad</h3>
                <div className="p-3 bg-muted rounded text-sm space-y-2">
                  <p>Ranjiva verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Nema ograničenja broja pokušaja prijave</li>
                    <li>
                      Precizne poruke otkrivaju da li korisnik postoji, da li je
                      lozinka kriva...
                    </li>
                    <li>Pokušajte više puta s krivim lozinkama</li>
                  </ul>

                  <p className="mt-3">Sigurna verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Rate limiting - maksimalno 3 pokušaja u 2 minute (po IP adresi)</li>
                    <li>Nejasne poruke ne otkrivaju što je krivo u formi</li>
                    <li>Nakon 3 pokušaja mora se čekat</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Krađa Session Tokena</h3>
                <div className="p-3 bg-muted rounded text-sm space-y-2">
                  <p>Ranjiva verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Prijavite se kao admin i dobit ćete token
                      &quot;user-1&quot;
                    </li>
                    <li>
                      U testu unesite &quot;user-2&quot; ili &quot;user-3&quot;
                      jer je jasno da id idu inkrementalno prema gore
                    </li>
                    <li>
                      Uspješno se pristupa tuđem računu bez lozinke jer se
                      pravimo da smo on preko njegove sjednice
                    </li>
                    <li>Tokeni nikada ne istječu</li>
                  </ul>

                  <p className="mt-3">Sigurna verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Prijavite se i dobit ćete kriptografski siguran token
                    </li>
                    <li>Pokušajte koristiti krivi token</li>
                    <li>Session hijacking ne uspijeva</li>
                    <li>Tokeni automatski istječu nakon 1 sata</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Lozinke u plaintextu</h3>
                <div className="p-3 bg-muted rounded text-sm space-y-2">
                  <p>Ranjiva verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Lozinke se čuvaju u plain textu u bazi podataka</li>
                    <li>Ako napadač pristupi bazi, može vidjeti sve lozinke</li>
                    <li>Lako je provjeriti ukradene lozinke</li>
                  </ul>

                  <p className="mt-3">Sigurna verzija:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Lozinke se hashiraju s bcrypt-om</li>
                    <li>Ako napadač pristupi bazi, ne može vidjeti lozinke</li>
                    <li>
                      Čak i ako ima hash ne može nabavit lozinku samo s njim
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Dodatne obrane koje bih dodao u prave aplikacije:</h3>
              <div className="p-3 bg-muted rounded text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Može se dodat dvofaktorska autentifikacija
                  </li>
                  <li>
                    Captcha za zaštitu od botova, npr. recaptcha, botid, turnstile...
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Testni korisnici:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>admin / admin123</p>
                <p>user1 / password1</p>
                <p>user2 / password2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BrokenAuthPage
