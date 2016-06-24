#!/usr/bin/perl

# This is script is to be used in association with dir_to_script/Report/wideInstrument.pm
# Ensure you have the line "use Report::wideInstrument qw (get_instrument_report)"
# To add dir/Report/wideInstrument.pm to @INC (where perl modules are accessed), either:
##### directly run it using perl but containing "use File::Basename qw(dirname); in the script
#					   							 use Cwd qw(abs_path);
#												 use lib dirname(dirname abs_path $0) . "/Report";"
##### add the folder to a directory in @INC or the folder to @INC
##### run the script using perl -IReport <perl script>

use warnings;
use strict;

use File::Basename qw(dirname);
use JSON;
use Data::Dumper;
use Cwd qw(abs_path);
use lib dirname(dirname abs_path $0) . "/Report";
use Report::wideInstrument qw (get_instrument_report get_XML_Data);
use Math::Round;

my $run = $ARGV[0];
my %returnObj;
$returnObj{"run_name"} = $run;
my @tempArray;

for (my $i = 1; $i < 9; $i++) {
	my $data = decode_json(get_XML_Data ($run, $i));
	#print Dumper($data);
	# BIN
	if (defined $data->{"BIN"} and $data->{"BIN"}->{"PF %"} ne 'null') {
		#$returnObj{"source"} = "BIN";
		push @tempArray, { r1_phasing => round(($data->{"BIN"}->{"R1 Phasing"} )*100)/100,
		r2_phasing => round(($data->{"BIN"}->{"R2 Phasing"} )*100)/100,
		r1_prephasing => round(($data->{"BIN"}->{"R1 Prephasing"} )*100)/100,
		r2_prephasing => round(($data->{"BIN"}->{"R2 Prephasing"} )*100)/100,
		pf_pct_sequencing => round(($data->{"BIN"}->{"PF %"} )*100)/100,
		lane => $i };
	#XML
	} elsif (defined $data->{"XML"}) {
		#$returnObj{"source"} = "XML";
		push @tempArray, { r1_phasing => round(($data->{"XML"}->{"R1 Phasing"} )*100)/100,
		r2_phasing => round(($data->{"XML"}->{"R2 Phasing"} )*100)/100,
		r1_prephasing => round(($data->{"XML"}->{"R1 Prephasing"} )*100)/100,
		r2_prephasing => round(($data->{"XML"}->{"R2 Prephasing"} )*100)/100,
		pf_pct_sequencing => round(($data->{"XML"}->{"PF %"} )*100)/100,
		lane => $i };
	}
}
$returnObj {"lanes"} = [@tempArray];
print encode_json(\%returnObj);