import { describe, it, expect } from 'vitest'
import { EMAIL_RE } from '@/lib/validation'

describe('EMAIL_RE', () => {
  describe('valid emails', () => {
    it('matches a standard email', () => {
      expect(EMAIL_RE.test('user@example.com')).toBe(true)
    })

    it('matches email with subdomain', () => {
      expect(EMAIL_RE.test('user@mail.example.com')).toBe(true)
    })

    it('matches email with dots in local part', () => {
      expect(EMAIL_RE.test('first.last@example.com')).toBe(true)
    })

    it('matches email with plus in local part', () => {
      expect(EMAIL_RE.test('user+tag@example.com')).toBe(true)
    })

    it('matches email with hyphens', () => {
      expect(EMAIL_RE.test('user-name@my-domain.org')).toBe(true)
    })

    it('matches email with underscores', () => {
      expect(EMAIL_RE.test('user_name@example.co')).toBe(true)
    })

    it('matches email with 2-char TLD', () => {
      expect(EMAIL_RE.test('user@example.io')).toBe(true)
    })

    it('matches email with long TLD', () => {
      expect(EMAIL_RE.test('user@example.photography')).toBe(true)
    })
  })

  describe('invalid emails', () => {
    it('rejects email without @', () => {
      expect(EMAIL_RE.test('userexample.com')).toBe(false)
    })

    it('rejects email without domain', () => {
      expect(EMAIL_RE.test('user@')).toBe(false)
    })

    it('rejects email without local part', () => {
      expect(EMAIL_RE.test('@example.com')).toBe(false)
    })

    it('rejects email without TLD', () => {
      expect(EMAIL_RE.test('user@example')).toBe(false)
    })

    it('rejects email with single-char TLD', () => {
      expect(EMAIL_RE.test('user@example.c')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(EMAIL_RE.test('')).toBe(false)
    })

    it('rejects plain text', () => {
      expect(EMAIL_RE.test('not an email')).toBe(false)
    })
  })
})
