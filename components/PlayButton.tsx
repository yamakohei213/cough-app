import React from "react"

import { CirclePlay } from "lucide-react"
import { Button } from "./ui/button"

export default function PlayButton(cough: number) {
  return (
    <Button
      size="icon-lg"
      variant={"outline"}
    >
      <CirclePlay />
    </Button>
  )
}
