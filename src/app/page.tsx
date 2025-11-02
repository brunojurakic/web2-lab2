"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Shield, ShieldAlert } from "lucide-react"

export default function Home() {
  const [isVulnerable, setIsVulnerable] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const endpoint = isVulnerable
        ? "/api/login/vulnerable"
        : "/api/login/secure"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      setResult(data)
    } catch {
      setResult({ success: false, message: "Mrežna greška" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">SQL Injection</h1>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isVulnerable ? (
                    <>
                      <ShieldAlert className="h-5 w-5 text-red-500" />
                      Ranjiva verzija
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 text-green-500" />
                      Sigurna verzija
                    </>
                  )}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="vulnerability-toggle">
                  {isVulnerable ? "Ranjivo" : "Sigurno"}
                </Label>
                <Switch
                  id="vulnerability-toggle"
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
                  type="text"
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
                  type="text"
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
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? "Uspjeh" : "Greška"}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{result.message}</p>
                  {result.user && (
                    <div className="mt-2 rounded text-sm">
                      <p>Korisnik: {result.user.username}</p>
                    </div>
                  )}
                  {result.queryExecuted && (
                    <div className="mt-2 rounded text-sm font-mono">
                      <p className="text-xs mb-1">SQL upit:</p>
                      {result.queryExecuted}
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
                <h3 className="font-semibold mb-2">
                  1. Testirajte normalnu prijavu
                </h3>
                <div className="p-3 bg-muted rounded text-sm space-y-1">
                  <p>Korisničko ime: admin</p>
                  <p>Lozinka: admin123</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  2. Testirajte SQL Injection verziju
                </h3>
                <div className="p-3 bg-muted rounded text-sm space-y-1">
                  <p>Korisničko ime: admin&apos; OR &apos;1&apos;=&apos;1</p>
                  <p>Lozinka: admin&apos; OR &apos;1&apos;=&apos;1</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Ranjivo: Prijava uspijeva bez lozinke
                  <br />
                  Sigurno: Napad je blokiran
                </p>
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
