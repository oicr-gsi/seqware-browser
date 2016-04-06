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
#use MongoDB::Collection;
#use MongoDB::MongoClient;

use File::Basename qw(dirname);
use JSON;
use Data::Dumper;
use Cwd qw(abs_path);
use lib dirname(dirname abs_path $0) . "/Report";
use Report::wideInstrument qw (get_instrument_report get_XML_Data);

my $run = $ARGV[0];
#my $client = MongoDB->connect('mongodb://10.30.128.97');
#my $collection = $client->ns('seqwareBrowser.RunReportDataPhasing');
my %returnObj;
$returnObj{"_id"} = $run;
for (my $i = 1; $i < 9; $i++) {
	my $data = decode_json(get_XML_Data ($run, $i));

	#print Dumper($data);
	# BIN
	if (defined $data->{"BIN"} and $data->{"BIN"}->{"PF %"} ne 'null') {
		my $R1Phasing = sprintf( "%.2f", $data->{"BIN"}->{"R1 Phasing"});
		my $R2Phasing = sprintf( "%.2f", $data->{"BIN"}->{"R2 Phasing"});
		my $R1Prephasing = sprintf( "%.2f", $data->{"BIN"}->{"R1 Prephasing"});
		my $R2Prephasing = sprintf( "%.2f", $data->{"BIN"}->{"R2 Prephasing"});
		$returnObj{"lane_$i"}{"PF% Sequencing"} = sprintf( "%.2f", $data->{"BIN"}->{"PF %"} );
		$returnObj{"lane_$i"}{"Phasing (R1/R2)"} = "$R1Phasing/$R2Phasing";
		$returnObj{"lane_$i"}{"Prephasing {R1/R2)"} = "$R1Prephasing/$R2Prephasing";
		$returnObj{"source"} = "BIN";
	} elsif (defined $data->{"XML"}) { #XML
		my $R1Phasing = sprintf( "%.2f", $data->{"XML"}->{"R1 Phasing"});
		my $R2Phasing = sprintf( "%.2f", $data->{"XML"}->{"R2 Phasing"});
		my $R1Prephasing = sprintf( "%.2f", $data->{"XML"}->{"R1 Prephasing"});
		my $R2Prephasing = sprintf( "%.2f", $data->{"XML"}->{"R2 Prephasing"});
		$returnObj{"lane_$i"}{"PF% Sequencing"} = sprintf( "%.2f", $data->{"XML"}->{"PF %"} );
		$returnObj{"lane_$i"}{"Phasing (R1/R2)"} = "$R1Phasing/$R2Phasing";
		$returnObj{"lane_$i"}{"Prephasing {R1/R2)"} = "$R1Prephasing/$R2Prephasing";
		$returnObj{"source"} = "XML";
	} else { #NIL
		$returnObj{"lane_$i"}{"PF% Sequencing"} = "n/a";
		$returnObj{"lane_$i"}{"Phasing (R1/R2)"} = "n/a";
		$returnObj{"lane_$i"}{"Prephasing {R1/R2)"} = "n/a";
		$returnObj{"source"} = "NIL";
	}
}
print encode_json(\%returnObj);
#$collection->update_one( {'_id' => $run}, { '$set' => \%returnObj }, {'upsert' => 1});
