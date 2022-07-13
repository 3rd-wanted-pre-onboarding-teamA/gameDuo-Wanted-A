create database gameduo_boss_raid_pve;
use gameduo_boss_raid_pve;
create table user ( -- 유저
  user_id varchar(50) not null,
  score int,
  primary key(user_id)
);
create table boss_raid ( -- 보스레이드
  raid_record_id int not null auto_increment,
  user_id varchar(50) not null,
  enter_time datetime default now(), 
  end_time datetime, 
  boss_raid_level int not null,
  success boolean default false,
  primary key(raid_record_id),
  constraint boss_raid_user_fk FOREIGN KEY (user_id)
  REFERENCES user(user_id) ON UPDATE CASCADE
);