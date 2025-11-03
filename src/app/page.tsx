"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>SQL Injection</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/sql-injection">
                <Button className="w-full">Otvori zadatak</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Broken Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/broken-auth">
                <Button className="w-full">Otvori zadatak</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
