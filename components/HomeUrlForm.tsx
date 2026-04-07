"use client"

import { useState } from "react"

import UrlForm from "@/components/UrlForm"
import { createDefaultWorkspaceState } from "@/lib/workspace"

export default function HomeUrlForm() {
  const [workspace, setWorkspace] = useState(() => createDefaultWorkspaceState())

  return <UrlForm workspace={workspace} onWorkspaceChange={setWorkspace} />
}
