<div align="center">

  # Redis로 랭킹 서비스를 구현한 보스레이드 PVE 컨텐츠 서비스 🎮
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=Express&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=MySQL&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=Redis&logoColor=white"/>
</p>

  ## 🌈 Team A members  

  |황선영|이승연|허정연|장덕수|
  |:------:|:------:|:------:|:------:|
  |[Github](https://github.com/syoungee) | [Github](https://github.com/dltmddus1998) | [Github](https://github.com/golgol22) | [Github](https://github.com/dapsu) |

</div> 
<br/>
<br/>

## 📒 Project

  <h4> ⏳  개발 기간  </h4> 
  2022/07/11  ~ 2022/07/15
  
<br/>
<br/>

## ✍🏻 프로젝트 설명
```
- 보스레이드 PVE 콘텐츠 관련하여 6가지 라우터를 작성합니다.
  i. 유저 생성
  ii. 유저 조회
  iii. 보스레이드 상태 조회
  iv. 보스레이드 시작
  v. 보스레이드 종료
  vi. 보스레이드 랭킹 조회
```

  ### ⭐ 필수 구현사항  
    - 작성한 API 정상 작동
    - 동시성 고려하려 로직 구현
    - 레이어 계층 분리(디렉토리 구조 세분화)
    - 다양한 에러 상황 처리
  ### 🌙 추가 구현사항
    - redis를 활용한 랭킹 기능 구현
    - staticData 캐싱 기능 구현
    - Test case 작성

<br/>
<br/>

## 🧚🏻 구현 기능

### RDBMS
> MySQL

#### Table
- 유저 테이블
- 테이블명: user
  
| Column | DataType | Key | Null | 비고 |
| --- | --- | --- | --- | --- |
| user_id | INT | PK | Not Null | auto increment  |
| score | INT |  | Not Null | default 0 |

<br/>

- 보스레이드 테이블
- 테이블명: boss_raid
  
| Column | DataType | Key | Null | 비고 |
| --- | --- | --- | --- | --- |
| raidRecordId | INT | PK | Not Null | auto increment  |
| user_id | INT | FK | Not Null |  |
| enter_time | DATATIME |  | Not Null | detault now() |
| end_time | DATATIME |  |  |  |
| boss_raid_level | INT |  | Not Null |  |
| success | BOOLEAN |  | Not Null | default false |

<br/>

### Caching
> Redis

- 보스레이드 상태 확인
```
key: raidStatus
value: raidRecordId
```

<br/>

- staticData
```
key: bossRaidData
value:
{
  "bossRaids": [
    {
      "bossRaidLimitSeconds": 180,
      "levels": [
        {
          "level": 0,
          "score": 20
        },
        {
          "level": 1,
          "score": 47
        },
        {
          "level": 2,
          "score": 85
        }
      ]
    }
  ]
}
```

<br/>

- 랭킹: Top 10 랭킹 저장 및 조회
```
key: topRankerInfoList
value: [
  {"user_id":3,"score":200},
  {"user_id":1,"score":140},
  {"user_id":2,"score":100},
  {"user_id":4,"score":0},
  {"user_id":5,"score":0} 
  ... 
]
```

<br/>
<br/>

## 🌴 TDD
Jest로 테스트 코드 구현 example

- 보스레이드 상태 조회 테스트
```
  보스레이드 상태 조회
    성공 시
      √ 레이드를 진행하고 있는 유저가 있을 시 canEnter: 1, 참가 중인 유저 아이디를 반환한다. (4 ms)
      √ 레이드를 진행하고 있는 유저가 없을 시 canEnter: 0을 반환한다.
```

<br/>

- 보스레이드 랭킹 조회 테스트
```
  보스레이드 랭킹 조회
    √ 보스레이드 랭킹 조회 성공 시 200 반환한다. (77 ms)
```

<br/>
<br/>

## 🍉 RestAPI
  |  | METHOD | URL | 
| --- | --- | --- | 
| 유저 생성 | POST | /user |
| 유저 조회 | GET | /user/[userId] |
| 보스레이드 상태 조회 | GET | /bossRaid |
| 보스레이드 시작 | POST | /bossRaid/enter |
| 보스레이드 종료 | PATCH | /bossRaid/end |
| 보스레이드 랭킹 조회 | GET | /bossRaid/topRankerList |
