
//TODO: add tests for finding and sorting when trailing lines are captured

//TODO: make assertions more granular to identify difference/failure. Below done to be quick.

describe("Test findIpv4Addresses function", function () {
	it("simple octet length matching", function () {
		var input;
		var output;
		var expected;

		input = "...\n" + //no match
			"0.0.0.0\n" +
			"1.1.1.1\n" +
			"11.11.11.11\n" +
			"111.111.111.111\n" +
			"255.255.255.255\n" +
			"1111.1111.1111.1111\n"; //no match

		expected = "0.0.0.0#\n" +
			"1.1.1.1#\n" +
			"11.11.11.11#\n" +
			"111.111.111.111#\n" +
			"255.255.255.255#\n";

		output = ipv4Tools.findIpv4Addresses(input);
		toEqualHashDelimited(output, expected);
	});

	it("simple test 2", function () {
		var input;
		var output;
		var expected;

		input = "0.0.0.0\n" +
			".2.1.1.1\n" + //no match
			"a.2.2.1.1\n" + //no match
			"1.2.1.1.1\n" + //no match
			"d1.2.1.1\n" + //no match
			"d.2.1.1.1\n" + //no match
			"d.2.1.1\n" + //no match

			"3.1.1.1.\n" + //match
			"3.2.1.1. \n" + //match
			"3.3.1.1.\t\n" + //match
			"3.4.1.1.@\n" + //no match
			"3.5.1.1/\n" + //match

			"3.6.1.1.a\n" + //no match
			"3.6.2.1..\n" + //no match
			"3.7.1.1.1\n" + //no match

			"5.6.1.1/32\n" + //match
			"5.6.2.1_32\n" + //match
			"5.6.3.1 32\n"; //match

		expected = "0.0.0.0#\n" +
			"3.1.1.1#\n" + //match
			"3.2.1.1#\n" + //match
			"3.3.1.1#\n" + //match
			"3.5.1.1#\n" + //match

			"5.6.1.1#\n" + //match
			"5.6.2.1#\n" + //match
			"5.6.3.1#\n"; //match

		output = ipv4Tools.findIpv4Addresses(input);
		toEqualHashDelimited(output, expected);
	});

});

describe("Test sortIpv4Addresses function", function () {
	it("simple octet length matching", function () {
		var input;
		var output;
		var expected;

		//try teasing out situation where "10" < "2" if using string comparison
		input = ["10.2.10.10",
			"10.0.0.2",
			"2.10.10.10",
			"1.1.1.1",
			"1.1.1.1",
			"10.0.0.3",
			"0.0.0.0",
			"10.0.0.0",
			"10.10.10.2",
			"10.10.2.10",
			"10.0.0.1",
			"10.10.10.10",
			"10.0.0.4"];

		expected = ['0.0.0.0',
			'1.1.1.1',
			'1.1.1.1',
			'2.10.10.10',
			'10.0.0.0',
			'10.0.0.1',
			'10.0.0.2',
			'10.0.0.3',
			'10.0.0.4',
			'10.2.10.10',
			'10.10.2.10',
			'10.10.10.2',
			'10.10.10.10'];

		output = ipv4Tools.sortIpv4Addresses(input);
		expect(output).toEqual(expected);
	});
});

function toEqualHashDelimited(output, expected) {
	output = output.concat("").join("#\n").trim();
	expected = expected.trim();
	expect(output).toEqual(expected);
}