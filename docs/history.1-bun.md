# Bun

## Bun이란?

> JavaScript와 TypeScript 애플리케이션을 위한 올인원(all-in-one) 툴킷이자 런타임 환경이며, JavaScriptCore(애플의 WebKit 엔진 기반)를 엔진으로 사용하며, 저수준 언어인 Zig로 개발되어 매우 빠른 성능을 제공함
>
> 기존 Node.js 생태계와 높은 호환성을 가지며, npm 패키지 사용, TypeScript/JSX 지원, 웹 표준 API(예: fetch, WebSocket) 내장 등 다양한 기능을 기본적으로 제공함
>
> - 자바스크립트 런타임(Node.js와 유사)
> - 패키지 매니저(npm, yarn, pnpm 대체)
> - 번들러(esbuild, webpack, parcel, rollup 대체)
> - 테스트 러너(Jest 대체)

## Bun의 장단점

|구분|장점|단점|
|:---:|:---:|:---:|
|성능|Node.js, Deno 대비 빠른 실행 속도, 효율적 메모리 관리|CPU 집약적 작업은 Node.js가 더 빠를 수 있음|
|개발환경|런타임, 패키지 매니저, 번들러, 테스트 러너 올인원 제공|생태계와 커뮤니티 미성숙, 문서 부족|
|호환성|Node.js, npm 패키지, ESM/CJS 동시 지원 |일부 네이티브 애드온, Windows 미완전 지원 <br/> 의존성 문제(특히 peer dependency 충돌 미감지, 일부 패키지 호환성 이슈)|
|편의성|TypeScript/JSX, 웹 표준 API 기본 지원, 핫 리로딩 등|실무 적용 시 예기치 못한 이슈 발생 가능|
|배포|단일 바이너리로 간편 배포, 환경 구축 용이| - |

## 의존성 문제

### Bun의 의존성 해결 메커니즘

1. 너비 우선(breadth-first) 알고리즘
    npm이 `깊이 우선(depth-first)` 방식으로 최신 버전을 우선 설치하는 반면, Bun은 모든 의존성의 버전 제약을 동시에 만족하는 `최소 공통 버전(Lowest Common Denominator)` 을 선택함

    예시: 패키지 A가 `library@^2.0.0`을, 패키지 B가 `library@^1.5.0`을 요구할 경우, Bun은 `1.5.0 ≤ version < 2.0.0` 범위의 호환 버전을 자동 선택함.

2. Peer Dependency 무시 정책
    npm은 peer dependency 충돌 시 설치를 중단하고 오류를 발생시키지만, Bun은 충돌을 감지하지 않고 설치를 진행함

    결과: React 19와 호환되지 않는 패키지가 있어도 Bun은 설치를 완료하며, 사용자는 --legacy-peer-deps 같은 플래그 없이도 설치가 가능함

3. 오버라이드(overrides) 지원
    package.json에 overrides 또는 resolutions 필드를 추가해 특정 의존성 버전을 강제 지정할 수 있음

    ```json
    {
      "overrides": {
        "problematic-package": "1.2.3"
      }
    }
    ```

    이는 보안 취약점이 있는 하위 의존성을 수동으로 고정할 때 유용함

### 잠재적 문제와 한계

1. 런타임 오류 가능성
    설치 성공 ≠ 실행 성공. 무시된 충돌이 애플리케이션 실행 시 문제를 일으킬 수 있음

2. 자동 해결 부재
    Bun은 충돌을 "회피"할 뿐 근본적 해결책이 아닙니다. 최종 검증은 개발자의 테스트가 필요함

#### npm/yarn 대비 Bun의 장점

|도구|설치 성공률|단점|런타임 안정성|
|:---:|:---:|:---:|:---:|
|npm|낮음 (오류 발생)|o|o|
|Yarn|중간 (경고만)|o|o|
|Bun|높음|x|?<br />(검증 필요)|

> - Bun은 의존성 충돌을 설치 단계에서 숨김으로써 npm의 번거로운 오류 처리를 회피함
> - 이는 개발 생산성을 높여주지만, 무시된 충돌이 런타임에 문제를 일으킬 수 있으므로 설치 후 반드시 애플리케이션 테스트가 필요함
> - Bun의 overrides 기능을 활용하면 특정 의존성을 강제 고정함으로써 추가적인 안정성을 확보할 수 있음å
