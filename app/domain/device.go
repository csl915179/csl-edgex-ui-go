package domain

import "gopkg.in/mgo.v2/bson"

type Device struct {
	Id          	bson.ObjectId	`bson:"_id,omitempty" json:"id"`
	Name        	string			`json:"name"`
	Description 	string			`json:"description"`
	Version     	string			`json:"version"`
	Localprofile	string			`bson:"localprofile" json:"localprofile"`
	Configdir		string 			`bson:"configdir" json:"configdir"`
	Created			int64			`bson:"created" json:"created"`
	Modified		int64			`bson:"modified" json:"modified"`
	InUse			bool			`bson:"inuse" json:"inuse"`
}
