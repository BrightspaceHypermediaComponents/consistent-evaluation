// Substitutes for D2L.LP.Web.UI.Files.File
export class File {
	constructor(id, fileSystemType) {
		this.m_id = id;
		this.m_fileSystemType = fileSystemType;
	}

	GetId() {
		return this.m_id;
	}

	GetFileSystemType() {
		return this.m_fileSystemType;
	}
}

// Substitutes for D2L.LP.Web.UI.Links.Link
export class Link {
	constructor(id, name, location, urn) {
		this.m_id = id;
		this.m_name = name;
		this.m_location = location;
		this.m_urn = urn;
	}

	GetId() {
		return this.m_id;
	}

	GetName() {
		return this.m_name;
	}

	GetLocation() {
		return this.m_location;
	}

	GetUrn() {
		return this.m_urn;
	}
}
