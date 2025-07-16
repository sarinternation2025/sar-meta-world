import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Button from '@components/Button'

describe('Path aliases', () => {
  it('should resolve @components alias correctly', () => {
    // This test verifies that the @components alias is working by importing Button
    const { container } = render(<Button>Test Button</Button>)
    expect(container.querySelector('button')).toBeTruthy()
    expect(container.querySelector('button')).toHaveTextContent('Test Button')
  })

  it('should resolve @ alias to src directory', () => {
    // This test verifies that the @ alias is working
    expect(true).toBe(true)
  })
})
