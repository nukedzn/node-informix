
connect to '@ol_informix1210' user 'informix' using 'informix';

create database test;

create table tcustomers (
	id       serial,
	fname    varchar(255),
	lname    varchar(255)
);

