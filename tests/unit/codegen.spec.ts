import { describe, it, expect } from 'vitest';
import { normalizeRequest } from '@/lib/network/normalize-request';
import { redactSecrets } from '@/lib/security/redact-secrets';
import { toCurl } from '@/lib/codegen/curl';
import { toFetch } from '@/lib/codegen/fetch';
import { toAxios } from '@/lib/codegen/axios';
import { toCSharp } from '@/lib/codegen/csharp';
import { toPython } from '@/lib/codegen/python';
import { toGo } from '@/lib/codegen/go';
import { toHttpie } from '@/lib/codegen/httpie';
import { toPhp } from '@/lib/codegen/php';
import get401Fixture from '../fixtures/har/get-401-with-bearer.json';
import post201Fixture from '../fixtures/har/post-json-201.json';
import type { HarEntry } from '@/types/network';

describe('Code Generators', () => {
  const { record: authedRecord } = redactSecrets(
    normalizeRequest(get401Fixture as unknown as HarEntry)
  );
  const { record: postRecord } = redactSecrets(
    normalizeRequest(post201Fixture as unknown as HarEntry)
  );

  describe('cURL', () => {
    it('generates valid cURL with redacted authorization header', () => {
      const curl = toCurl(authedRecord);
      expect(curl).toContain("curl 'https://api.example.com/v1/profile/me'");
      expect(curl).toContain("-H 'authorization: Bearer •••••••••••'");
      // Must not contain the raw token
      expect(curl).not.toContain('sensitive_payload');
    });

    it('generates cURL for POST with payload', () => {
      const curl = toCurl(postRecord);
      expect(curl).toContain("-X POST");
      expect(curl).toContain("--data-raw");
      expect(curl).toContain('•••••••••••');
      expect(curl).not.toContain('SuperSecret123!');
    });
  });

  describe('Fetch', () => {
    it('generates fetch call for GET request', () => {
      const code = toFetch(authedRecord);
      expect(code).toContain("await fetch('https://api.example.com/v1/profile/me'");
      expect(code).toContain('"authorization": "Bearer •••••••••••"');
    });

    it('generates fetch call for POST with body', () => {
      const code = toFetch(postRecord);
      expect(code).toContain('"method": "POST"');
      expect(code).toContain('JSON.stringify(');
      expect(code).toContain('•••••••••••');
    });
  });

  describe('Axios', () => {
    it('generates axios.get with headers', () => {
      const code = toAxios(authedRecord);
      expect(code).toContain("await axios.get('https://api.example.com/v1/profile/me'");
      expect(code).toContain('"authorization": "Bearer •••••••••••"');
    });

    it('generates axios.post with body and headers', () => {
      const code = toAxios(postRecord);
      expect(code).toContain("await axios.post(");
      expect(code).toContain("'https://api.example.com/v1/auth/register'");
      expect(code).toContain('•••••••••••');
    });
  });

  describe('C# HttpClient', () => {
    it('generates C# HttpClient code for request', () => {
      const code = toCSharp(authedRecord);
      expect(code).toContain('using var client = new HttpClient();');
      expect(code).toContain('using var request = new HttpRequestMessage(new HttpMethod("GET")');
      expect(code).toContain('request.Headers.TryAddWithoutValidation("authorization", "Bearer •••••••••••")');
      expect(code).toContain('var response = await client.SendAsync(request);');
    });

    it('generates C# code with StringContent for POST', () => {
      const code = toCSharp(postRecord);
      expect(code).toContain('request.Content = new StringContent(@');
      expect(code).toContain('•••••••••••');
    });
  });

  describe('Python requests', () => {
    it('generates requests.get with headers', () => {
      const code = toPython(authedRecord);
      expect(code).toContain('import requests');
      expect(code).toContain('requests.get("https://api.example.com/v1/profile/me"');
      expect(code).toContain('"authorization": "Bearer •••••••••••"');
    });

    it('generates requests.post with json payload', () => {
      const code = toPython(postRecord);
      expect(code).toContain('requests.post(');
      expect(code).toContain('json=payload');
      expect(code).toContain('•••••••••••');
    });
  });

  describe('Go net/http', () => {
    it('generates Go net/http request', () => {
      const code = toGo(authedRecord);
      expect(code).toContain('package main');
      expect(code).toContain('http.NewRequest("GET", "https://api.example.com/v1/profile/me", nil)');
      expect(code).toContain('req.Header.Set("authorization", "Bearer •••••••••••")');
    });

    it('generates Go request with payload', () => {
      const code = toGo(postRecord);
      expect(code).toContain('strings.NewReader(');
      expect(code).toContain('http.NewRequest("POST"');
      expect(code).toContain('•••••••••••');
    });
  });

  describe('HTTPie', () => {
    it('generates HTTPie command with headers', () => {
      const code = toHttpie(authedRecord);
      expect(code).toContain("http GET 'https://api.example.com/v1/profile/me'");
      expect(code).toContain("'authorization:Bearer •••••••••••'");
    });

    it('generates HTTPie command for POST with body', () => {
      const code = toHttpie(postRecord);
      expect(code).toContain("http POST 'https://api.example.com/v1/auth/register'");
      expect(code).toContain('•••••••••••');
    });
  });

  describe('PHP cURL', () => {
    it('generates PHP cURL snippet', () => {
      const code = toPhp(authedRecord);
      expect(code).toContain('<?php');
      expect(code).toContain('$curl = curl_init();');
      expect(code).toContain('CURLOPT_URL => "https://api.example.com/v1/profile/me"');
      expect(code).toContain('"authorization: Bearer •••••••••••"');
    });

    it('generates PHP cURL snippet for POST with body', () => {
      const code = toPhp(postRecord);
      expect(code).toContain('CURLOPT_POSTFIELDS =>');
      expect(code).toContain('•••••••••••');
    });
  });
});
