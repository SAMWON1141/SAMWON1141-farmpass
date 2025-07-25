/**
 * 서버사이드에서 클라이언트 IP 주소를 추출하는 헬퍼 함수들
 */

import { NextRequest } from "next/server";

/**
 * IP 주소를 정규화 (IPv6 매핑된 IPv4 주소를 IPv4로 변환)
 * 클라이언트와 서버 모두에서 사용 가능
 */
export function normalizeIP(ip: string): string {
  if (!ip) return ip;

  // IPv6 매핑된 IPv4 주소를 IPv4로 변환 (::ffff:127.0.0.1 -> 127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  // IPv6 localhost를 IPv4 localhost로 변환
  if (ip === "::1") {
    return "127.0.0.1";
  }

  return ip;
}

/**
 * NextRequest에서 클라이언트의 실제 IP 주소를 추출
 * 프록시, CDN, 로드밸런서 등을 고려한 우선순위로 검색
 */
export function getClientIP(request: NextRequest): string {
  // 우선순위 순서로 헤더 확인
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for는 여러 IP가 콤마로 구분될 수 있음 (첫 번째가 원본 클라이언트)
      const ip = normalizeIP(value.split(",")[0].trim());
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Next.js의 기본 IP (로컬 개발환경에서는 보통 ::1 또는 127.0.0.1)
  const nextIP = request.ip;
  if (nextIP) {
    const normalizedIP = normalizeIP(nextIP);
    if (isValidIP(normalizedIP)) {
      return normalizedIP;
    }
  }

  // 개발 환경에서는 localhost IP 반환
  if (process.env.NODE_ENV !== "production") {
    return "127.0.0.1";
  }

  // 모든 방법이 실패하면 기본값
  return "unknown";
}

/**
 * IP 주소 형식이 유효한지 검증
 */
function isValidIP(ip: string): boolean {
  if (!ip || ip === "unknown") return false;

  // IPv4 정규식 (localhost 포함)
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 정규식 (localhost 포함)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  // localhost 특별 처리
  if (ip === "localhost" || ip === "127.0.0.1" || ip === "::1") {
    return true;
  }

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Request에서 User-Agent 추출
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "Unknown";
}

/**
 * IP 기반 위치 정보 가져오기
 */
export async function getLocationFromIP(ip: string): Promise<string> {
  // localhost나 private IP는 건너뛰기
  if (
    ip === "127.0.0.1" ||
    ip === "localhost" ||
    ip === "unknown" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return "로컬 네트워크";
  }

  try {
    // 무료 IP 위치 API 사용 (ipapi.co)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        "User-Agent": "FarmApp/1.0",
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || "Unknown error");
    }

    // 한국어로 위치 정보 구성
    const location = [];
    if (data.city) location.push(data.city);
    if (data.region) location.push(data.region);
    if (data.country_name) location.push(data.country_name);

    return location.length > 0 ? location.join(", ") : "알 수 없음";
  } catch (error) {
    // 에러 발생 시 기본값 반환
    return "알 수 없음";
  }
}

/**
 * Request에서 로그 컨텍스트에 필요한 정보를 모두 추출 (위치 정보 포함)
 */
export async function extractRequestContextWithLocation(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);

  // 위치 정보는 비동기로 가져오기
  const location = await getLocationFromIP(ip);

  return {
    ip,
    userAgent,
    location,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  };
}
