import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Button(props) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
  }
  return (
    <div className={`px-4 py-3 ${props.className}`} onClick={() => handleNavigate(props.path)}>{props.title}</div>
  )
}
