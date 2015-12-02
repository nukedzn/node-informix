
connect to '@ol_informix1210' user 'informix' using 'informix';

create database test;


create table tcustomers (
	id       serial,
	fname    varchar(255),
	lname    varchar(255)
);

create unique index icustomers_x1 on tcustomers(id);

alter table tcustomers add constraint primary key (id)
	constraint ccustomers_pk;


create procedure pInsCustomer(
	p_fname like tcustomers.fname,
	p_lname like tcustomers.lname
)
returning int;

	define v_id like tcustomers.id;
	return v_id;

end procedure;

