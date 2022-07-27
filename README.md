<div align="center">

  # Redis로 랭킹 서비스를 구현한 보스레이드 PVE 컨텐츠 서비스 🎮
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=Express&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=MySQL&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=Redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=flat&logo=Amazon EC2&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=flat&logo=Amazon RDS&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon ElastiCache-1c5a9a?style=flat&logo=redis&logoColor=white"/></br>
</p>

  ## 🌈 Team A members  

  |황선영|이승연|허정연|장덕수|
  |:------:|:------:|:------:|:------:|
  |[Github](https://github.com/syoungee) | [Github](https://github.com/dltmddus1998) | [Github](https://github.com/golgol22) | [Github](https://github.com/dapsu) |

</div> 

<br/>

## 🎮 노션링크
더 상세한 개발 내용을 확인할 수 있어요!  
https://www.notion.so/Redis-PVE-d0844ebf1f714566adc01be8859c5cc9

<br/>

## ⏳ 개발 기간
2022.07.11  ~ 2022.07.15
  
<br/>
  
## 🎬 프로젝트 시연
http://3.37.230.135/ (포스트맨으로 주요 기능을 테스트해보세요!)

#### 유저 게임 기록 조회: `GET` http://3.37.230.135/user/2

```
request {
}

response {
  "totalScore": 47,
  "bossRaidHistory": [
    {
      "raidRecordId": 2,
      "enterTime": "2022-07-27 06:15:34",
      "endTime": "2022-07-27 06:18:30"
    }
  ]
}
```

#### 보스레이드 시작: `POST` http://3.37.230.135/bossRaid/enter
- 보스레이드 게임이 진행중이지 않으면 게임 시작가능

```
request {
  "userId": 1,
  "level": 1
}

response {
  "message": "게임이 시작되었습니다.",
  "isEntered": true,
  "raidRecordId": 3
}
```

#### top 랭킹 조회/내 랭킹 조회 기능: `GET` http://3.37.230.135/bossraid/topRankerList
- 높은 점수 순으로 top 10 반환

```
request {
  "userId": 4
}

response {
  "topRankerInfoList": [
    {
      "ranking": 0,
      "userId": 1,
      "totalScore": 0
    },
    ...
    {
      "ranking": 9,
      "userId": 10,
      "totalScore": 0
    }
  ],
  "myRankingInfo": {
    "ranking": 4,
    "userId": 4,
    "totalScore": 0
  }
}
```

 
<br/>

## 🕸️ 구성도
![gameduo](https://user-images.githubusercontent.com/94504613/181658493-0780fff6-d961-42da-a501-14b49271a1fb.png)

<br/>

## ✍🏻 프로젝트 

보스레이드 PVE 콘텐츠 관련하여 6가지 라우터를 작성합니다.  
  - 유저 생성
  - 유저 조회
  - 보스레이드 상태 조회
  - 보스레이드 시작
  - 보스레이드 종료
  - 보스레이드 랭킹 조회


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

## 🧚🏻 데이터 저장 

### RDBMS (MySQL) 테이블 명세서

#### ERD
![erd](https://user-images.githubusercontent.com/94504613/181670482-c09f2646-4959-4f95-91a7-1de591cb42c8.png)

#### `user` 유저 정보 저장 테이블
  
| Column | DataType | Key | Null | 비고 |
| --- | --- | --- | --- | --- |
| user_id | INT | PK | Not Null | auto increment  |
| score | INT |  | Not Null | default 0 |

#### `boss_raid` 보스레이드 게임 시작 종료 정보 저장 테이블
  
| Column | DataType | Key | Null | 비고 |
| --- | --- | --- | --- | --- |
| raidRecordId | INT | PK | Not Null | auto increment  |
| user_id | INT | FK | Not Null |  |
| enter_time | DATATIME |  | Not Null | detault now() |
| end_time | DATATIME |  |  |  |
| boss_raid_level | INT |  | Not Null |  |
| success | BOOLEAN |  | Not Null | default false |

<br/>

### Caching (Redis)

#### 보스레이드 상태 확인
```
key: raidStatus
value: raidRecordId
```

#### staticData: 게임시간과 레벨에 따른 점수 데이터 저장
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

#### 랭킹: Top 10 랭킹 저장 및 조회
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

## 🌴 TDD
### Jest로 테스트 코드 구현 내용

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

## 🍉 REST API
  |  | METHOD | URL | 
| --- | --- | --- | 
| 유저 생성 | POST | /user |
| 유저 조회 | GET | /user/:userId |
| 보스레이드 상태 조회 | GET | /bossRaid |
| 보스레이드 시작 | POST | /bossRaid/enter |
| 보스레이드 종료 | PATCH | /bossRaid/end |
| 보스레이드 랭킹 조회 | GET | /bossRaid/topRankerList |
