create database gameduo_boss_raid_pve;
use gameduo_boss_raid_pve;
create table user ( -- 유저
    user_id int not null,
    score int,
    primary key(user_id)
);
create table boss_raid ( -- 가계부
    raid_record_id int not null auto_increment,
    user_id int not null,
    enter_time datetime not null, 
    end_time datetime not null, 
    boss_raid_level int not null,
    success boolean not null,
    primary key(raid_record_id),
    constraint boss_raid_user_fk FOREIGN KEY (user_id)
    REFERENCES user(user_id) ON UPDATE CASCADE
);