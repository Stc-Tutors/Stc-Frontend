"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select"

export default function BasicInformationForm({ onNext, data }: any) {
  const [title, setTitle] = useState(data.title || "")
  const [subtitle, setSubtitle] = useState(data.subtitle || "")
  const [category, setCategory] = useState(data.category || "")
  const [language, setLanguage] = useState(data.language || "")

  const handleSubmit = () => {
    onNext({ title, subtitle, category, language })
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>Select Category</SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">Tech</SelectItem>
          <SelectItem value="math">Math</SelectItem>
          <SelectItem value="science">Science</SelectItem>
        </SelectContent>
      </Select>

      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger>Select Language</SelectTrigger>
        <SelectContent>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="french">French</SelectItem>
        </SelectContent>
      </Select>

      <Button className="mt-4" onClick={handleSubmit}>
        Save & Next
      </Button>
    </div>
  )
}